
import { useAuth } from "@/hooks/useAuth";
import { useScanEmails } from "@/hooks/useScanEmails";
import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import EmailScanner from "@/components/EmailScanner";
import ScanTypeSelector from "@/components/ScanTypeSelector";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MusicPlayer from "@/components/MusicPlayer";

type ScanType = 'smart-deletion' | 'sender-analysis' | 'smart-sorting' | null;

const Index = () => {
  const { authState, loginWithGmail, logout } = useAuth();
  const { scanState, scanEmails, deleteEmails, exportToCsv } = useScanEmails();
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [selectedScanType, setSelectedScanType] = useState<ScanType>(null);

  // Le lecteur de musique est visible après une première authentification ou après activation manuelle
  const shouldShowMusicPlayer = authState.isAuthenticated || showMusicPlayer;

  const handleToggleMusic = () => {
    setShowMusicPlayer(true);
  };

  const handleSelectScanType = (scanType: ScanType) => {
    setSelectedScanType(scanType);
  };

  const handleBackToSelection = () => {
    setSelectedScanType(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isAuthenticated={authState.isAuthenticated} 
        userEmail={authState.userEmail} 
        onLogout={logout}
        onToggleMusic={handleToggleMusic}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl mx-auto py-8">
          {!authState.isAuthenticated && (
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-[#38c39d]">L'intelligence qui trie vos mails, l'éthique qui les nettoie.</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Supprimez l'inutile, classez l'essentiel et reprenez le contrôle de votre boîte mail.
              </p>
            </div>
          )}

          <div className="flex justify-center">
            {!authState.isAuthenticated ? (
              <LoginForm 
                onLoginWithGmail={loginWithGmail} 
                isLoading={authState.loading}
              />
            ) : selectedScanType ? (
              <div className="w-full space-y-4">
                <div className="flex justify-center">
                  <button 
                    onClick={handleBackToSelection}
                    className="text-[#38c39d] hover:underline mb-4"
                  >
                    ← Retour à la sélection du type de scan
                  </button>
                </div>
                <EmailScanner 
                  scanState={scanState}
                  onScan={scanEmails}
                  onDelete={deleteEmails}
                  onExport={exportToCsv}
                  userEmail={authState.userEmail || ""}
                  scanType={selectedScanType}
                />
              </div>
            ) : (
              <ScanTypeSelector 
                onSelectScanType={handleSelectScanType}
                userEmail={authState.userEmail || ""}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Lecteur de musique d'ambiance */}
      <MusicPlayer 
        isVisible={shouldShowMusicPlayer}
        isScanning={scanState.isScanning}
      />
    </div>
  );
};

export default Index;

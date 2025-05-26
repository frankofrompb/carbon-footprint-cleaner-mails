
import { useAuth } from "@/hooks/useAuth";
import { useScanEmails } from "@/hooks/useScanEmails";
import LoginForm from "@/components/LoginForm";
import EmailScanner from "@/components/EmailScanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MusicPlayer from "@/components/MusicPlayer";
import { ServiceType } from "@/components/ServiceSelector";

const Index = () => {
  const { authState, loginWithGmail, logout } = useAuth();
  const { scanState, scanEmails, deleteEmails, exportToCsv } = useScanEmails();

  // Le lecteur de musique est visible après une première authentification
  const shouldShowMusicPlayer = authState.isAuthenticated;

  const handleLoginWithGmail = (serviceType: ServiceType) => {
    console.log("🎯 Service sélectionné dans Index:", serviceType);
    loginWithGmail(serviceType);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isAuthenticated={authState.isAuthenticated} 
        userEmail={authState.userEmail} 
        onLogout={logout}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-[#38c39d]">L'intelligence qui trie vos mails, l'éthique qui les nettoie.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Supprimez l'inutile, classez l'essentiel et reprenez le contrôle de votre boîte mail.
            </p>
          </div>

          <div className="flex justify-center">
            {!authState.isAuthenticated ? (
              <LoginForm 
                onLoginWithGmail={handleLoginWithGmail} 
                isLoading={authState.loading} 
              />
            ) : (
              <EmailScanner 
                scanState={scanState}
                onScan={scanEmails}
                onDelete={deleteEmails}
                onExport={exportToCsv}
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

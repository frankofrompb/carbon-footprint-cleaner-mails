
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useScanEmails } from "@/hooks/useScanEmails";
import ScanTypeSelector from "@/components/ScanTypeSelector";
import EmailScanner from "@/components/EmailScanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ScanType = 'smart-deletion' | 'sender-analysis' | 'smart-sorting' | 'intelligent-scan';

const Dashboard = () => {
  const { authState, logout } = useAuth();
  const { scanState, startScan, deleteBulkEmails, exportResults } = useScanEmails();
  const [selectedScanType, setSelectedScanType] = useState<ScanType | null>(null);

  console.log('🏠 Dashboard - État actuel:', {
    scanState: scanState.status,
    userEmail: authState.userEmail,
    hasResults: !!scanState.results,
    selectedScanType
  });

  const handleSelectScanType = (scanType: ScanType) => {
    console.log('🎯 Type de scan sélectionné:', scanType);
    setSelectedScanType(scanType);
  };

  const handleStartScan = async () => {
    if (!selectedScanType) return;
    console.log('🚀 Démarrage du scan:', selectedScanType);
    await startScan(selectedScanType);
  };

  const handleDeleteEmails = (emailIds: string[]) => {
    console.log('🗑️ Suppression d\'emails:', emailIds);
    deleteBulkEmails(emailIds);
  };

  const handleExportResults = () => {
    console.log('📤 Export des résultats');
    exportResults();
  };

  const handleBackToSelection = () => {
    setSelectedScanType(null);
  };

  if (!authState.userEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#38c39d] to-[#2d8b61] flex items-center justify-center">
        <div className="text-white text-xl">Redirection vers la connexion...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#38c39d] to-[#2d8b61]">
      <Header 
        isAuthenticated={!!authState.userEmail}
        userEmail={authState.userEmail}
        onLogout={logout}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-6xl">
            {!selectedScanType ? (
              <ScanTypeSelector
                onSelectScanType={handleSelectScanType}
                userEmail={authState.userEmail}
                onScan={handleStartScan}
              />
            ) : (
              <EmailScanner
                scanState={scanState}
                onScan={handleStartScan}
                onDelete={handleDeleteEmails}
                onExport={handleExportResults}
                userEmail={authState.userEmail}
                scanType={selectedScanType}
                onBackToSelection={handleBackToSelection}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;

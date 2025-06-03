
import { useState } from "react";
import ScanTypeSelector from "@/components/ScanTypeSelector";
import EmailScanner from "@/components/EmailScanner";
import ModernLandingPage from "@/components/ModernLandingPage";
import Dashboard from "@/pages/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { useScanEmails } from "@/hooks/useScanEmails";

type ScanType = 'smart-deletion' | 'sender-analysis' | 'smart-sorting';

const Index = () => {
  const { scanState, scanEmails, deleteEmails, exportToCsv } = useScanEmails();
  const [selectedScanType, setSelectedScanType] = useState<ScanType | null>(null);
  const { authState, loginWithGmail, logout } = useAuth();

  const handleScanEmails = (scanType?: ScanType) => {
    scanEmails(scanType);
  };

  const handleSelectScanType = (scanType: ScanType) => {
    setSelectedScanType(scanType);
  };

  const handleLoginWithGmail = () => {
    loginWithGmail();
  };

  const handleLogout = () => {
    logout();
  };

  // Si l'utilisateur est connecté, afficher le dashboard
  if (authState.userEmail) {
    return <Dashboard />;
  }

  // Sinon afficher la landing page
  return (
    <div className="min-h-screen flex flex-col">
      <ModernLandingPage 
        onLoginWithGmail={handleLoginWithGmail}
        isLoading={authState.loading}
      />
    </div>
  );
};

export default Index;

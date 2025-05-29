
import { useState } from "react";
import ScanTypeSelector from "@/components/ScanTypeSelector";
import EmailScanner from "@/components/EmailScanner";
import LoginForm from "@/components/LoginForm";
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

  return (
    <div className="container mx-auto py-12">
      {!authState.userEmail ? (
        <LoginForm 
          onLoginWithGmail={handleLoginWithGmail}
          isLoading={authState.loading}
        />
      ) : selectedScanType ? (
        <EmailScanner
          scanState={scanState}
          onScan={() => handleScanEmails(selectedScanType)}
          onDelete={deleteEmails}
          onExport={exportToCsv}
          userEmail={authState.userEmail}
          scanType={selectedScanType}
        />
      ) : (
        <ScanTypeSelector
          onSelectScanType={handleSelectScanType}
          userEmail={authState.userEmail}
          onScan={() => handleScanEmails()}
        />
      )}
    </div>
  );
};

export default Index;


import { useState } from "react";
import ScanTypeSelector from "@/components/ScanTypeSelector";
import EmailScanner from "@/components/EmailScanner";
import { useAuth } from "@/hooks/useAuth";
import { useScanEmails } from "@/hooks/useScanEmails";

type ScanType = 'smart-deletion' | 'sender-analysis' | 'smart-sorting';

const Index = () => {
  const { scanState, scanEmails, deleteEmails, exportToCsv } = useScanEmails();
  const [selectedScanType, setSelectedScanType] = useState<ScanType | null>(null);
  const { authState, logout } = useAuth();

  const handleScanEmails = (scanType?: ScanType) => {
    scanEmails(scanType);
  };

  const handleSelectScanType = (scanType: ScanType) => {
    setSelectedScanType(scanType);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto py-12">
      {!authState.userEmail ? (
        <div className="text-center">
          <p className="text-lg">Vous n'êtes pas connecté. Veuillez vous connecter pour continuer.</p>
        </div>
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

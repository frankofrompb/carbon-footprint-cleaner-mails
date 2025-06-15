
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useScanEmails } from "@/hooks/useScanEmails";
import { useScanResultsHandler } from "@/hooks/useScanResultsHandler";
import EmailScanner from "@/components/EmailScanner";
import ScanTypeSelector from "@/components/ScanTypeSelector";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type ScanType = 'smart-deletion' | 'sender-analysis' | 'smart-sorting' | 'intelligent-scan';

const Dashboard = () => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { toast } = useToast();
  const { scanState, startScan, deleteBulkEmails, exportResults } = useScanEmails();
  const { processRawScanData, validateScanResults } = useScanResultsHandler();
  const [selectedScanType, setSelectedScanType] = useState<ScanType | null>(null);

  console.log('🏠 Dashboard - État actuel:', {
    scanState: scanState.status,
    selectedScanType,
    userEmail: authState.userEmail,
    hasResults: !!scanState.results
  });

  const handleScanTypeSelection = (scanType: ScanType) => {
    console.log('🎯 Type de scan sélectionné:', scanType);
    setSelectedScanType(scanType);
  };

  const handleStartScan = async () => {
    if (!selectedScanType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de scan",
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 Démarrage du scan:', selectedScanType);
    
    try {
      // Démarrer le scan avec le type sélectionné
      await startScan(selectedScanType);
      
      console.log('✅ Scan terminé, vérification des résultats...');
      
      // Une fois le scan terminé, vérifier les résultats
      if (scanState.results) {
        console.log('📊 Résultats disponibles, redirection vers ScanResults...');
        
        // 🚨 TRANSMISSION DES VRAIES DONNÉES vers ScanResults
        navigate('/scan-results', {
          state: {
            scanResults: scanState.results,
            scanType: selectedScanType
          }
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du scan:', error);
      toast({
        title: "Erreur lors du scan",
        description: "Une erreur s'est produite pendant l'analyse",
        variant: "destructive",
      });
    }
  };

  // Surveiller les changements d'état du scan pour rediriger automatiquement
  useState(() => {
    if (scanState.status === 'completed' && scanState.results) {
      console.log('🔄 Scan completed détecté, redirection automatique...');
      
      // Redirection automatique avec les données
      navigate('/scan-results', {
        state: {
          scanResults: scanState.results,
          scanType: selectedScanType
        }
      });
    }
  });

  const handleDeleteEmails = (emailIds: string[]) => {
    console.log('🗑️ Suppression d\'emails:', emailIds);
    deleteBulkEmails(emailIds);
  };

  const handleExportResults = () => {
    console.log('📤 Export des résultats');
    exportResults();
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
          
          {!selectedScanType && (
            <ScanTypeSelector 
              onSelectScanType={handleScanTypeSelection}
              userEmail={authState.userEmail}
              onScan={handleStartScan}
            />
          )}

          {selectedScanType && (
            <div className="w-full max-w-4xl">
              <EmailScanner
                scanState={scanState}
                onScan={handleStartScan}
                onDelete={handleDeleteEmails}
                onExport={handleExportResults}
                userEmail={authState.userEmail}
                scanType={selectedScanType}
              />
            </div>
          )}
          
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;

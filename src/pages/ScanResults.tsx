
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IntelligentScanDisplay from "@/components/scan/IntelligentScanDisplay";
import { ScanResults as ScanResultsType } from "@/types";
import { ArrowLeft } from "lucide-react";

const ScanResults = () => {
  const navigate = useNavigate();
  const [scanResults, setScanResults] = useState<ScanResultsType | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 PAGE SCAN-RESULTS - Chargement des résultats...');
    
    // Récupérer les résultats du scan depuis le localStorage
    const storedResults = localStorage.getItem('scanResults');
    const storedAuth = localStorage.getItem('emailCleanerAuth');
    
    console.log('🔥 DONNÉES RÉCUPÉRÉES:', {
      hasStoredResults: !!storedResults,
      hasStoredAuth: !!storedAuth,
      storedResultsLength: storedResults?.length || 0
    });
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        console.log('🔥 RÉSULTATS PARSÉS:', {
          totalEmails: parsedResults.totalEmails,
          emailsCount: parsedResults.emails?.length,
          hasSummary: !!parsedResults.summary
        });
        setScanResults(parsedResults);
      } catch (error) {
        console.error('❌ Erreur lors du parsing des résultats:', error);
      }
    } else {
      console.log('❌ AUCUN RÉSULTAT TROUVÉ - Redirection vers le dashboard');
      navigate('/dashboard');
    }
    
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setUserEmail(parsedAuth.email);
      } catch (error) {
        console.error('❌ Erreur lors du parsing de l\'auth:', error);
      }
    }
  }, [navigate]);

  const handleDeleteSelected = (emailIds: string[]) => {
    console.log('🗑️ Suppression demandée pour:', emailIds.length, 'emails');
    // TODO: Implémenter la suppression réelle
  };

  const handleExport = () => {
    console.log('📊 Export demandé');
    // TODO: Implémenter l'export réel
  };

  const handleBackToDashboard = () => {
    // Nettoyer les résultats et retourner au dashboard
    localStorage.removeItem('scanResults');
    navigate('/dashboard');
  };

  if (!scanResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Chargement des résultats...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button 
            onClick={handleBackToDashboard}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Button>
        </div>

        <IntelligentScanDisplay
          results={scanResults}
          userEmail={userEmail}
          onDeleteSelected={handleDeleteSelected}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default ScanResults;

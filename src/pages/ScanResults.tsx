
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanResults } from "@/types";
import IntelligentScanDisplay from "@/components/scan/IntelligentScanDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ScanResultsPage = () => {
  const navigate = useNavigate();
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 ScanResults - Chargement de la page');
    
    // Récupérer les résultats du scan depuis le localStorage ou l'état global
    const storedResults = localStorage.getItem("lastScanResults");
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    
    console.log('📊 ScanResults - Données stockées:', {
      hasStoredResults: !!storedResults,
      hasStoredAuth: !!storedAuth
    });

    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        console.log('✅ ScanResults - Résultats récupérés:', {
          totalEmails: results.totalEmails,
          emailsCount: results.emails?.length
        });
        setScanResults(results);
      } catch (error) {
        console.error('❌ ScanResults - Erreur parsing résultats:', error);
      }
    }

    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        setUserEmail(auth.email);
        console.log('👤 ScanResults - Email utilisateur:', auth.email);
      } catch (error) {
        console.error('❌ ScanResults - Erreur parsing auth:', error);
      }
    }
  }, []);

  const handleDeleteSelected = async (emailIds: string[]) => {
    console.log('🗑️ ScanResults - Suppression demandée:', emailIds.length);
    // TODO: Implémenter la suppression
  };

  const handleExport = () => {
    console.log('📤 ScanResults - Export demandé');
    // TODO: Implémenter l'export
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!scanResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Aucun résultat de scan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Aucun résultat de scan trouvé. Veuillez d'abord effectuer un scan intelligent.
                </p>
                <Button onClick={handleBackToDashboard}>
                  Retour au tableau de bord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
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

export default ScanResultsPage;

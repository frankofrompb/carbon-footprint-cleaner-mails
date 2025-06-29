
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanResults } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AutoOrganizationSection from "@/components/scan/AutoOrganizationSection";

const AutoOrganization = () => {
  const navigate = useNavigate();
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedResults = localStorage.getItem("lastScanResults");
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        setScanResults(results);
      } catch (error) {
        console.error('❌ AutoOrganization - Erreur parsing résultats:', error);
      }
    }

    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        setUserEmail(auth.email);
      } catch (error) {
        console.error('❌ AutoOrganization - Erreur parsing auth:', error);
      }
    }
  }, []);

  const handleOrganizeSelected = async (emailIds: string[]) => {
    console.log('📁 AutoOrganization - Organisation demandée:', emailIds.length);
    // TODO: Implémenter l'organisation réelle
  };

  const handleBackToResults = () => {
    navigate('/scan-results');
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
                <Button onClick={() => navigate('/dashboard')}>
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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToResults}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux résultats
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Organisation Automatique</h1>
            <p className="text-sm text-gray-600">
              Connecté à <span className="font-semibold">{userEmail}</span>
            </p>
          </div>
        </div>

        <AutoOrganizationSection 
          results={scanResults}
          onOrganizeSelected={handleOrganizeSelected}
        />
      </div>
    </div>
  );
};

export default AutoOrganization;

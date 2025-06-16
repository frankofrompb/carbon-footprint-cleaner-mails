
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanResults } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, BarChart3, Archive } from "lucide-react";
import SmartDeletionSection from "@/components/scan/SmartDeletionSection";
import AdvancedClassificationSection from "@/components/scan/AdvancedClassificationSection";
import AutoOrganizationSection from "@/components/scan/AutoOrganizationSection";

const ScanResultsPage = () => {
  const navigate = useNavigate();
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 ScanResults - Chargement de la page');
    
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
    // TODO: Implémenter la suppression réelle
  };

  const handleOrganizeSelected = async (emailIds: string[]) => {
    console.log('📁 ScanResults - Organisation demandée:', emailIds.length);
    // TODO: Implémenter l'organisation réelle
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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Résultats du Scan Intelligent</h1>
            <p className="text-sm text-gray-600">
              Connecté à <span className="font-semibold">{userEmail}</span>
            </p>
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
            <p className="text-sm text-blue-600">📧 Total emails</p>
            <p className="text-3xl font-bold text-blue-700">{scanResults.totalEmails}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center border border-green-200">
            <p className="text-sm text-green-600">💾 Taille totale</p>
            <p className="text-3xl font-bold text-green-700">
              {scanResults.totalSizeMB ? scanResults.totalSizeMB.toFixed(1) : '0.0'} Mo
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg text-center border border-orange-200">
            <p className="text-sm text-orange-600">🌍 Empreinte carbone</p>
            <p className="text-3xl font-bold text-orange-700">
              {Math.round((scanResults.carbonFootprint || 0) / 1000)} kg CO₂
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-200">
            <p className="text-sm text-purple-600">🧪 Échantillon analysé</p>
            <p className="text-3xl font-bold text-purple-700">{scanResults.emails?.length || 0}</p>
          </div>
        </div>

        {/* Sections principales */}
        <div className="space-y-8">
          <SmartDeletionSection 
            results={scanResults}
            onDeleteSelected={handleDeleteSelected}
          />
          
          <AdvancedClassificationSection 
            results={scanResults}
          />
          
          <AutoOrganizationSection 
            results={scanResults}
            onOrganizeSelected={handleOrganizeSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default ScanResultsPage;

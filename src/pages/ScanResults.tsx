
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Mail, 
  Leaf, 
  BarChart3,
  Users,
  Clock,
  Zap,
  Target
} from "lucide-react";
import { ScanResults as ScanResultsType } from "@/types";
import Dashboard from "@/components/Dashboard";
import IntelligentScanResults from "@/components/IntelligentScanResults";
import SenderAnalysisView from "@/components/SenderAnalysisView";
import SmartSortingView from "@/components/SmartSortingView";
import { formatNumber } from "@/lib/utils";

interface LocationState {
  scanResults?: ScanResultsType;
  scanType?: 'smart-deletion' | 'sender-analysis' | 'smart-sorting' | 'intelligent-scan';
}

const ScanResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Récupérer les données transmises depuis Dashboard
  const locationState = location.state as LocationState;
  const scanResults = locationState?.scanResults;
  const scanType = locationState?.scanType || 'smart-deletion';

  console.log('🎯 ScanResults - État reçu:', {
    hasLocationState: !!locationState,
    hasScanResults: !!scanResults,
    scanType,
    totalEmails: scanResults?.totalEmails,
    emailsCount: scanResults?.emails?.length,
    locationKeys: locationState ? Object.keys(locationState) : 'aucune'
  });

  // États pour l'animation progressive
  const [displayedEmails, setDisplayedEmails] = useState(0);
  const [displayedCarbonFootprint, setDisplayedCarbonFootprint] = useState(0);
  const [displayedSummary, setDisplayedSummary] = useState({
    oldUnreadEmails: 0,
    promotionalEmails: 0,
    socialEmails: 0,
    notificationEmails: 0,
    spamEmails: 0,
    autoClassifiableEmails: 0,
    duplicateSenderEmails: 0
  });

  // Valeurs réelles depuis scanResults
  const realTotalEmails = scanResults?.totalEmails || 0;
  const realCarbonFootprint = scanResults?.carbonFootprint || 0;
  const realSummary = scanResults?.summary || {
    oldUnreadEmails: 0,
    promotionalEmails: 0,
    socialEmails: 0,
    notificationEmails: 0,
    spamEmails: 0,
    autoClassifiableEmails: 0,
    duplicateSenderEmails: 0
  };

  // Animation des compteurs avec les VRAIES données
  useEffect(() => {
    const duration = 2000; // 2 secondes
    const steps = 60;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      setDisplayedEmails(prev => {
        const increment = realTotalEmails / steps;
        const newValue = prev + increment;
        return newValue >= realTotalEmails ? realTotalEmails : newValue;
      });

      setDisplayedCarbonFootprint(prev => {
        const increment = realCarbonFootprint / steps;
        const newValue = prev + increment;
        return newValue >= realCarbonFootprint ? realCarbonFootprint : newValue;
      });

      setDisplayedSummary(prev => ({
        oldUnreadEmails: Math.min(prev.oldUnreadEmails + (realSummary.oldUnreadEmails / steps), realSummary.oldUnreadEmails),
        promotionalEmails: Math.min(prev.promotionalEmails + (realSummary.promotionalEmails / steps), realSummary.promotionalEmails),
        socialEmails: Math.min(prev.socialEmails + (realSummary.socialEmails / steps), realSummary.socialEmails),
        notificationEmails: Math.min(prev.notificationEmails + (realSummary.notificationEmails / steps), realSummary.notificationEmails),
        spamEmails: Math.min(prev.spamEmails + (realSummary.spamEmails / steps), realSummary.spamEmails),
        autoClassifiableEmails: Math.min(prev.autoClassifiableEmails + (realSummary.autoClassifiableEmails / steps), realSummary.autoClassifiableEmails),
        duplicateSenderEmails: Math.min(prev.duplicateSenderEmails + (realSummary.duplicateSenderEmails / steps), realSummary.duplicateSenderEmails)
      }));
    }, stepDuration);

    return () => clearInterval(timer);
  }, [realTotalEmails, realCarbonFootprint, realSummary]);

  // Générer des données d'emails à partir des VRAIES données du scan
  useEffect(() => {
    if (scanResults?.emails && scanResults.emails.length > 0) {
      console.log('✅ Emails disponibles dans scanResults:', scanResults.emails.length);
    } else {
      console.log('⚠️ Aucun email trouvé dans scanResults');
    }
  }, [scanResults]);

  // Si pas de données, rediriger vers dashboard
  if (!scanResults) {
    console.log('❌ Aucune donnée de scan, redirection vers dashboard...');
    navigate('/dashboard');
    return null;
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleDeleteSelected = (emailIds: string[]) => {
    toast({
      title: "Suppression en cours",
      description: "Les emails sélectionnés sont en cours de suppression...",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export en cours",
      description: "Le fichier CSV est en cours de génération...",
    });
  };

  const handleOrganizeSelected = (emailIds: string[]) => {
    toast({
      title: "Organisation en cours",
      description: "Les emails sélectionnés sont en cours d'organisation...",
    });
  };

  // Rendu conditionnel selon le type de scan
  const renderScanTypeContent = () => {
    switch (scanType) {
      case 'intelligent-scan':
        return (
          <IntelligentScanResults 
            results={scanResults}
            onDeleteSelected={handleDeleteSelected}
            onOrganizeSelected={handleOrganizeSelected}
          />
        );
      case 'sender-analysis':
        return (
          <SenderAnalysisView 
            scanState={{ results: scanResults, status: 'completed', error: null, progress: 100 }}
          />
        );
      case 'smart-sorting':
        return (
          <SmartSortingView 
            scanState={{ results: scanResults, status: 'completed', error: null, progress: 100 }}
          />
        );
      default:
        // Vue par défaut pour smart-deletion
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#38c39d] to-[#2d8b61] p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Button
                  variant="outline"
                  onClick={handleBackToDashboard}
                  className="bg-white/90 backdrop-blur-md hover:bg-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour au tableau de bord
                </Button>
                <h1 className="text-3xl font-bold text-white">Résultats du scan</h1>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExport}
                    className="bg-white/90 backdrop-blur-md text-[#38c39d] hover:bg-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </div>

              {/* Section DEBUG - DONNÉES RÉELLES */}
              <Card className="mb-8 bg-yellow-100 border-yellow-400">
                <CardHeader>
                  <CardTitle className="text-yellow-800">🔧 DEBUG - Données réelles du scan</CardTitle>
                </CardHeader>
                <CardContent className="text-yellow-800">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Type de scan:</strong> {scanType}
                    </div>
                    <div>
                      <strong>Total emails:</strong> {scanResults?.totalEmails || 0}
                    </div>
                    <div>
                      <strong>Emails dans le tableau:</strong> {scanResults?.emails?.length || 0}
                    </div>
                    <div>
                      <strong>Empreinte carbone:</strong> {scanResults?.carbonFootprint || 0}g
                    </div>
                    <div>
                      <strong>Taille totale:</strong> {scanResults?.totalSizeMB || 0} MB
                    </div>
                    <div>
                      <strong>A un summary:</strong> {scanResults?.summary ? 'Oui' : 'Non'}
                    </div>
                    {scanResults?.summary && (
                      <>
                        <div>
                          <strong>Emails anciens non lus:</strong> {scanResults.summary.oldUnreadEmails || 0}
                        </div>
                        <div>
                          <strong>Emails promotionnels:</strong> {scanResults.summary.promotionalEmails || 0}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white/90 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Emails trouvés</p>
                        <p className="text-3xl font-bold text-[#38c39d]">
                          {Math.floor(displayedEmails).toLocaleString()}
                        </p>
                      </div>
                      <Mail className="h-8 w-8 text-[#38c39d]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">CO₂ économisable</p>
                        <p className="text-3xl font-bold text-[#38c39d]">
                          {Math.floor(displayedCarbonFootprint)}g
                        </p>
                      </div>
                      <Leaf className="h-8 w-8 text-[#38c39d]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Emails anciens</p>
                        <p className="text-3xl font-bold text-orange-500">
                          {Math.floor(displayedSummary.oldUnreadEmails).toLocaleString()}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Promotionnels</p>
                        <p className="text-3xl font-bold text-blue-500">
                          {Math.floor(displayedSummary.promotionalEmails).toLocaleString()}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dashboard avec les vraies données */}
              <Card className="bg-white/90 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-[#38c39d]" />
                    Analyse détaillée de votre boîte mail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Dashboard scanResults={scanResults} />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => handleDeleteSelected([])}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Supprimer les emails sélectionnés
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderScanTypeContent();
};

export default ScanResults;

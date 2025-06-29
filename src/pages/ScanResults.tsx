
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanResults } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, BarChart3, Archive, Mail, Users, Bell } from "lucide-react";

const ScanResultsPage = () => {
  const navigate = useNavigate();
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 ScanResults - Chargement de la page');
    
    const storedResults = localStorage.getItem("lastScanResults");
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        setScanResults(results);
      } catch (error) {
        console.error('❌ ScanResults - Erreur parsing résultats:', error);
      }
    }

    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        setUserEmail(auth.email);
      } catch (error) {
        console.error('❌ ScanResults - Erreur parsing auth:', error);
      }
    }
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const navigateToSection = (section: string) => {
    navigate(`/${section}`);
  };

  if (!scanResults) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              🌊
            </div>
            <span className="text-xl font-bold text-gray-900">EcoInBox</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <span>✓</span>
            <span>Scan terminé</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Results Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Résultats du Scan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Votre boîte mail a été analysée. Voici les opportunités de nettoyage identifiées.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{scanResults.totalEmails.toLocaleString()}</div>
            <div className="text-gray-600 font-medium">Emails analysés</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{(scanResults.summary?.oldUnreadEmails || 0).toLocaleString()}</div>
            <div className="text-gray-600 font-medium">Actions suggérées</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{scanResults.totalSizeMB?.toFixed(1) || '0.0'} MB</div>
            <div className="text-gray-600 font-medium">Espace libérable</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{Math.round((scanResults.carbonFootprint || 0) / 1000)} kg</div>
            <div className="text-gray-600 font-medium">CO₂ économisable</div>
          </div>
        </div>

        {/* Results Sections */}
        <div className="space-y-8">
          {/* Section 1: Emails non ouverts */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  📬
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {(scanResults.summary?.oldUnreadEmails || 0).toLocaleString()} emails non ouverts depuis 6+ mois
                  </h3>
                  <p className="text-gray-600 text-sm">Ces emails n'ont pas été consultés depuis longtemps</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                -{Math.round((scanResults.summary?.oldUnreadEmails || 0) * 0.01)} kg CO₂
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{scanResults.summary?.promotionalEmails || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Promotions</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{scanResults.summary?.socialEmails || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Réseaux sociaux</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{scanResults.summary?.notificationEmails || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Notifications</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto border border-gray-200">
              {scanResults.emails?.slice(0, 3).map((email, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{email.from}</div>
                    <div className="text-gray-600 text-xs mt-1 truncate max-w-xs">{email.subject}</div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <div>Non lu depuis {email.daysSinceReceived} jours</div>
                    <div>{email.size || 0} KB</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button 
                onClick={() => navigateToSection('smart-deletion')}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer tous les emails non ouverts
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigateToSection('smart-deletion')}
              >
                👁️ Examiner en détail
              </Button>
            </div>
          </div>

          {/* Section 2: Classification par volume */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  🏷️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {scanResults.emails?.length || 0} emails à classer par volume
                  </h3>
                  <p className="text-gray-600 text-sm">Emails groupés par expéditeur et fréquence</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                -{Math.round((scanResults.totalEmails || 0) * 0.002)} kg CO₂
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{Math.round((scanResults.totalEmails || 0) * 0.1)}</div>
                <div className="text-xs text-gray-600 mt-1">Expéditeurs uniques</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{Math.round((scanResults.totalEmails || 0) / 30)}</div>
                <div className="text-xs text-gray-600 mt-1">Emails/jour</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">89%</div>
                <div className="text-xs text-gray-600 mt-1">Jamais ouverts</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => navigateToSection('advanced-classification')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Classer par actions
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigateToSection('advanced-classification')}
              >
                ✉️ Désabonnements groupés
              </Button>
            </div>
          </div>

          {/* Section 3: Organisation automatique */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  📁
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {Math.round((scanResults.totalEmails || 0) * 0.2)} emails à organiser automatiquement
                  </h3>
                  <p className="text-gray-600 text-sm">Classement intelligent par catégories</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                -{Math.round((scanResults.totalEmails || 0) * 0.0015)} kg CO₂
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{Math.round((scanResults.totalEmails || 0) * 0.05)}</div>
                <div className="text-xs text-gray-600 mt-1">Factures/Reçus</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{Math.round((scanResults.totalEmails || 0) * 0.03)}</div>
                <div className="text-xs text-gray-600 mt-1">Voyages</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{Math.round((scanResults.totalEmails || 0) * 0.02)}</div>
                <div className="text-xs text-gray-600 mt-1">Réseaux sociaux</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => navigateToSection('auto-organization')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Archive className="h-4 w-4 mr-2" />
                Organiser automatiquement
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigateToSection('auto-organization')}
              >
                ⚙️ Personnaliser les dossiers
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-12 bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">🌱 Impact Environnemental Total</h2>
          <div className="w-full h-2 bg-white bg-opacity-20 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '73%' }}></div>
          </div>
          <p className="text-sm opacity-90">
            En appliquant toutes ces actions, vous économiserez <strong>{Math.round((scanResults.carbonFootprint || 0) / 1000)} kg de CO₂</strong> et libérerez <strong>{scanResults.totalSizeMB?.toFixed(1) || '0.0'} MB d'espace</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScanResultsPage;

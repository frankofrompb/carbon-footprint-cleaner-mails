
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useScanEmails } from "@/hooks/useScanEmails";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Leaf, Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { authState, logout } = useAuth();
  const { scanEmails, scanState } = useScanEmails();
  const navigate = useNavigate();
  const [animatedStats, setAnimatedStats] = useState({
    emails: 0,
    space: 0,
    co2: 0
  });

  // Animation des statistiques au chargement
  useEffect(() => {
    const targets = { emails: 12847, space: 3.2, co2: 145 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedStats({
        emails: Math.floor(targets.emails * progress),
        space: parseFloat((targets.space * progress).toFixed(1)),
        co2: Math.floor(targets.co2 * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(targets);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Rediriger vers les résultats après un scan réussi
  useEffect(() => {
    if (scanState.status === 'completed') {
      // Attendre un peu pour que l'utilisateur voie le succès
      setTimeout(() => {
        navigate('/scan-results');
      }, 2000);
    }
  }, [scanState.status, navigate]);

  const handleStartScan = () => {
    console.log('🚀 Démarrage du scan intelligent réel...');
    scanEmails('intelligent-scan');
  };

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getUserName = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' ' + 
             parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return email.split('@')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#38c39d] to-[#2d8b61]">
      <Header 
        isAuthenticated={!!authState.userEmail}
        userEmail={authState.userEmail}
        onLogout={logout}
      />
      
      <div className="container mx-auto px-5 py-8 max-w-6xl">
        {/* Header Card */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#38c39d] to-[#2d8b61] rounded-xl flex items-center justify-center text-white text-2xl">
                  <Leaf />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                  <span className="text-[#38c39d]">Eco</span>InBox
                </h1>
              </div>
              
              {authState.userEmail && (
                <div className="flex items-center gap-4 bg-[#38c39d]/10 px-5 py-3 rounded-full border-2 border-[#38c39d]/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#38c39d] to-[#2d8b61] rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(authState.userEmail)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{getUserName(authState.userEmail)}</div>
                    <div className="text-gray-600 text-sm">{authState.userEmail}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Centered Scan Card */}
        <div className="flex justify-center mb-10">
          <div className="w-full max-w-2xl">
            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-15 h-15 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center text-white text-3xl">
                    <Search />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">Scan Intelligent Réel</h2>
                </div>

                {/* Alerte pour le scan réel */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Scan de votre vraie boîte Gmail</strong><br />
                    Ce scan va analyser tous vos emails réels pour détecter les catégories d'optimisation. 
                    Temps estimé : 2-5 minutes selon la taille de votre boîte.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-[#38c39d]/10 rounded-xl border border-[#38c39d]/20">
                    <span className="text-2xl font-bold text-[#38c39d] block">{animatedStats.emails.toLocaleString()}</span>
                    <div className="text-gray-600 text-xs mt-1">Emails estimés</div>
                  </div>
                  <div className="text-center p-4 bg-[#38c39d]/10 rounded-xl border border-[#38c39d]/20">
                    <span className="text-2xl font-bold text-[#38c39d] block">{animatedStats.space} GB</span>
                    <div className="text-gray-600 text-xs mt-1">Espace estimé</div>
                  </div>
                  <div className="text-center p-4 bg-[#38c39d]/10 rounded-xl border border-[#38c39d]/20">
                    <span className="text-2xl font-bold text-[#38c39d] block">{animatedStats.co2} kg</span>
                    <div className="text-gray-600 text-xs mt-1">CO₂ estimé</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Le scan intelligent va :</h3>
                  <div className="space-y-3">
                    {[
                      "Analyser TOUS vos emails Gmail (peut prendre quelques minutes)",
                      "Détecter les emails non lus depuis +6 mois",
                      "Classifier automatiquement promotions, réseaux sociaux, notifications",
                      "Identifier les expéditeurs avec emails multiples",
                      "Calculer l'impact carbone réel de votre boîte"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[#38c39d]/5 rounded-lg">
                        <div className="w-5 h-5 bg-[#38c39d] rounded-full flex items-center justify-center text-white text-xs">✓</div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleStartScan}
                  disabled={scanState.status === 'scanning'}
                  className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg py-4 rounded-2xl"
                >
                  {scanState.status === 'scanning' ? '⏳ Scan en cours...' : '🚀 Lancer le Scan Intelligent RÉEL'}
                </Button>

                {scanState.status === 'scanning' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800 mb-2">
                      <strong>Scan en cours...</strong> Progression : {scanState.progress}%
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                        style={{width: `${scanState.progress}%`}}
                      ></div>
                    </div>
                  </div>
                )}

                {scanState.status === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm text-red-800">
                      <strong>Erreur :</strong> {scanState.error}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Stats */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📈 Impact Total avec EcoInBox</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { number: "171.8 kg", label: "CO₂ économisé" },
                { number: "8,265", label: "Emails nettoyés" },
                { number: "12.4 GB", label: "Espace libéré" },
                { number: "386", label: "Arbres sauvés" }
              ].map((stat, index) => (
                <div key={index} className="p-6 bg-gradient-to-br from-[#38c39d] to-[#2d8b61] rounded-2xl text-white">
                  <span className="text-3xl font-bold block">{stat.number}</span>
                  <div className="text-sm opacity-90 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;

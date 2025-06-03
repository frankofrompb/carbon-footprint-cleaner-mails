
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, Mail, Tag, FolderOpen } from "lucide-react";

const ScanResults = () => {
  const { authState, logout } = useAuth();
  const [animatedStats, setAnimatedStats] = useState({
    totalEmails: 0,
    totalSpace: 0,
    suggestedActions: 0,
    co2Saveable: 0,
    unreadEmails: 0,
    categorizeEmails: 0,
    organizeEmails: 0
  });
  const [categoryOptionsVisible, setCategoryOptionsVisible] = useState(false);

  // Animation des statistiques au chargement
  useEffect(() => {
    const targets = {
      totalEmails: 12847,
      totalSpace: 3.2,
      suggestedActions: 8542,
      co2Saveable: 89.3,
      unreadEmails: 3247,
      categorizeEmails: 2856,
      organizeEmails: 2439
    };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedStats({
        totalEmails: Math.floor(targets.totalEmails * progress),
        totalSpace: parseFloat((targets.totalSpace * progress).toFixed(1)),
        suggestedActions: Math.floor(targets.suggestedActions * progress),
        co2Saveable: parseFloat((targets.co2Saveable * progress).toFixed(1)),
        unreadEmails: Math.floor(targets.unreadEmails * progress),
        categorizeEmails: Math.floor(targets.categorizeEmails * progress),
        organizeEmails: Math.floor(targets.organizeEmails * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(targets);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const handleUnreadEmails = () => {
    // Logique pour supprimer les emails non lus
    console.log("Suppression des emails non lus...");
  };

  const toggleCategoryOptions = () => {
    setCategoryOptionsVisible(!categoryOptionsVisible);
  };

  const organizeEmails = () => {
    // Logique pour organiser les emails
    console.log("Organisation des emails...");
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
        {/* Header avec succès */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-4xl animate-pulse">
              <CheckCircle2 />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Scan Terminé avec Succès !</h1>
            <p className="text-xl text-gray-600">Votre boîte mail a été analysée. Voici ce que nous avons trouvé :</p>
          </CardContent>
        </Card>

        {/* Résumé du scan */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Résumé du Scan</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <span className="text-3xl font-bold text-gray-800 block">{animatedStats.totalEmails.toLocaleString()}</span>
                <div className="text-gray-600 text-sm mt-2">Emails analysés</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <span className="text-3xl font-bold text-gray-800 block">{animatedStats.totalSpace} GB</span>
                <div className="text-gray-600 text-sm mt-2">Espace total</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <span className="text-3xl font-bold text-gray-800 block">{animatedStats.suggestedActions.toLocaleString()}</span>
                <div className="text-gray-600 text-sm mt-2">Actions suggérées</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <span className="text-3xl font-bold text-gray-800 block">{animatedStats.co2Saveable} kg</span>
                <div className="text-gray-600 text-sm mt-2">CO₂ économisable</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions container */}
        <div className="space-y-8">
          {/* Section 1: Emails non ouverts */}
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-18 h-18 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                    <Mail />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-800 mb-2">
                      Vous avez <span className="text-4xl font-bold text-red-500">{animatedStats.unreadEmails.toLocaleString()}</span> emails non ouverts depuis plus de 6 mois
                    </div>
                    <div className="text-gray-600 text-lg">
                      Ces emails n'ont pas été consultés depuis longtemps et représentent probablement du contenu obsolète ou non pertinent.
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white px-4 py-2 rounded-full font-semibold">
                  -32.1 kg CO₂
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">2,104</span>
                  <div className="text-gray-600 text-sm mt-1">Newsletters</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">896</span>
                  <div className="text-gray-600 text-sm mt-1">Promotions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">247</span>
                  <div className="text-gray-600 text-sm mt-1">Notifications</div>
                </div>
              </div>
              
              <Button 
                onClick={handleUnreadEmails}
                className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg py-4 rounded-2xl"
              >
                🗑️ Supprimer les Emails Non Ouverts
              </Button>
            </CardContent>
          </Card>

          {/* Section 2: Emails à catégoriser */}
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-18 h-18 bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                    <Tag />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-800 mb-2">
                      Vous avez <span className="text-4xl font-bold text-red-500">{animatedStats.categorizeEmails.toLocaleString()}</span> emails qui ont besoin d'être catégorisés
                    </div>
                    <div className="text-gray-600 text-lg">
                      Ces emails nécessitent votre attention pour décider s'il faut les conserver, vous désabonner, les supprimer ou les marquer comme spam.
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white px-4 py-2 rounded-full font-semibold">
                  -28.7 kg CO₂
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">1,523</span>
                  <div className="text-gray-600 text-sm mt-1">Promotions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">887</span>
                  <div className="text-gray-600 text-sm mt-1">Newsletters</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">446</span>
                  <div className="text-gray-600 text-sm mt-1">Suspects spam</div>
                </div>
              </div>
              
              <Button 
                onClick={toggleCategoryOptions}
                className="w-full bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg py-4 rounded-2xl"
              >
                📝 Commencer la Catégorisation
              </Button>
              
              {categoryOptionsVisible && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl animate-fade-in">
                  <p className="mb-4 font-medium">Pour chaque email, choisissez une action :</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button className="bg-green-100 text-green-800 hover:bg-green-200 transition-all hover:scale-105">
                      💾 Conserver
                    </Button>
                    <Button className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-all hover:scale-105">
                      ✉️ Désabonner
                    </Button>
                    <Button className="bg-red-100 text-red-800 hover:bg-red-200 transition-all hover:scale-105">
                      🗑️ Supprimer
                    </Button>
                    <Button className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-all hover:scale-105">
                      🚫 Spam
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Emails à classer */}
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-18 h-18 bg-gradient-to-br from-[#A8E6CF] to-[#7FCDCD] rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                    <FolderOpen />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-800 mb-2">
                      Vous avez <span className="text-4xl font-bold text-red-500">{animatedStats.organizeEmails.toLocaleString()}</span> emails que je peux classer dans des dossiers pour vous
                    </div>
                    <div className="text-gray-600 text-lg">
                      Ces emails peuvent être automatiquement organisés dans des dossiers thématiques pour améliorer votre productivité.
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white px-4 py-2 rounded-full font-semibold">
                  -18.4 kg CO₂
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">1,206</span>
                  <div className="text-gray-600 text-sm mt-1">Factures/Reçus</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">743</span>
                  <div className="text-gray-600 text-sm mt-1">Réseaux sociaux</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">490</span>
                  <div className="text-gray-600 text-sm mt-1">Voyages/Réservations</div>
                </div>
              </div>
              
              <Button 
                onClick={organizeEmails}
                className="w-full bg-gradient-to-r from-[#A8E6CF] to-[#7FCDCD] text-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg py-4 rounded-2xl"
              >
                📂 Organiser Automatiquement
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Section de progression */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg mt-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🌱 Progression vers un Email Plus Vert</h2>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-full animate-[fillProgress_3s_ease_forwards] w-0"></div>
            </div>
            <div className="text-lg text-gray-600">
              En appliquant toutes ces actions, vous économiserez <strong>79.2 kg de CO₂</strong> et libérerez <strong>2.1 GB d'espace</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
      
      <style jsx>{`
        @keyframes fillProgress {
          to { width: 75%; }
        }
      `}</style>
    </div>
  );
};

export default ScanResults;

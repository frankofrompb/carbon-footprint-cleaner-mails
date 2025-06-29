
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Leaf, 
  Trash2, 
  BarChart3, 
  FolderOpen, 
  Eye, 
  Rocket,
  Play,
  ChartLine,
  Wand2,
  X,
  LogIn,
  UserPlus
} from "lucide-react";

interface ModernLandingPageProps {
  onLoginWithGmail: () => void;
  isLoading: boolean;
}

const ModernLandingPage = ({ onLoginWithGmail, isLoading }: ModernLandingPageProps) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openModal = (type: 'login' | 'register') => {
    if (type === 'login') {
      setShowLoginModal(true);
    } else {
      setShowRegisterModal(true);
    }
  };

  const closeModal = (type: 'login' | 'register') => {
    if (type === 'login') {
      setShowLoginModal(false);
    } else {
      setShowRegisterModal(false);
    }
  };

  const switchModal = (from: 'login' | 'register', to: 'login' | 'register') => {
    closeModal(from);
    setTimeout(() => openModal(to), 200);
  };

  const handleStartCleaning = () => {
    console.log("🚀 Démarrage de l'authentification Gmail depuis ModernLandingPage");
    onLoginWithGmail();
  };

  const handleModalLogin = () => {
    console.log("🔐 Connexion depuis la modale");
    closeModal('login');
    // Petite pause pour fermer la modale avant de déclencher l'auth
    setTimeout(() => {
      onLoginWithGmail();
    }, 200);
  };

  const handleModalRegister = () => {
    console.log("📝 Création de compte depuis la modale");
    closeModal('register');
    // Petite pause pour fermer la modale avant de déclencher l'auth
    setTimeout(() => {
      onLoginWithGmail();
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#38c39d] to-[#2d8b61]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center text-2xl font-bold">
              <img 
                src="/lovable-uploads/27bd2091-5617-46a0-9308-d9e74b0086c4.png" 
                alt="EcoInBox Logo" 
                className="mr-3 h-10 w-10 object-contain"
              />
              <span className="text-[#38c39d]">Eco</span>
              <span className="text-black">InBox</span>
            </div>
            <ul className="hidden md:flex space-x-8">
              <li><a href="#services" className="text-gray-600 hover:text-[#38c39d] font-medium transition-colors">Services</a></li>
              <li><a href="#tableau-bord" className="text-gray-600 hover:text-[#38c39d] font-medium transition-colors">Tableau de bord</a></li>
              <li><a href="#tarifs" className="text-gray-600 hover:text-[#38c39d] font-medium transition-colors">Tarifs</a></li>
            </ul>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => openModal('login')}
                disabled={isLoading}
                className="border-2 border-[#38c39d] text-[#38c39d] hover:bg-[#38c39d] hover:text-white rounded-full disabled:opacity-50"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Connexion..." : "Connexion"}
              </Button>
              <Button
                onClick={() => openModal('register')}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#38c39d] to-[#2d8b61] hover:shadow-lg hover:-translate-y-0.5 transition-all rounded-full disabled:opacity-50"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "Création..." : "Créer un compte"}
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent leading-tight">
            L'intelligence qui trie vos mails,<br />l'éthique qui les nettoie.
          </h1>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Supprimez l'inutile, classez l'essentiel et reprenez le contrôle de votre boîte mail.
          </p>
          
          <div className="flex flex-wrap justify-center gap-12 my-12">
            <div className="text-center">
              <div className="text-4xl font-bold">4.1kg</div>
              <div className="opacity-80 text-sm">CO₂ économisé par utilisateur</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">15k+</div>
              <div className="opacity-80 text-sm">Boîtes mail nettoyées</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">2.5M</div>
              <div className="opacity-80 text-sm">Emails supprimés</div>
            </div>
          </div>

          <Button
            onClick={handleStartCleaning}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#38c39d] to-[#2d8b61] hover:shadow-xl hover:-translate-y-1 transition-all text-lg px-8 py-3 rounded-full disabled:opacity-50"
          >
            <Rocket className="mr-2 h-5 w-5" />
            {isLoading ? "Connexion..." : "Commencer gratuitement"}
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Trois approches intelligentes pour optimiser votre boîte mail
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-[#38c39d] hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#38c39d] to-[#2d8b61] rounded-xl flex items-center justify-center mb-6">
                  <Trash2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Suppression intelligente</h3>
                <p className="text-gray-600 mb-6">
                  Identifiez et supprimez automatiquement les emails non ouverts depuis une période personnalisable.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Analyse des emails non lus depuis X jours/mois
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Détection des newsletters inactives
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Suppression sécurisée avec confirmation
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Sauvegarde avant suppression
                  </li>
                </ul>
                <Button className="bg-gradient-to-r from-[#38c39d] to-[#2d8b61] rounded-full">
                  <Play className="mr-2 h-4 w-4" />
                  Démarrer l'analyse
                </Button>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-[#38c39d] hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#38c39d] to-[#2d8b61] rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Classification avancée</h3>
                <p className="text-gray-600 mb-6">
                  Analysez vos emails par expéditeur, volume et taux d'ouverture pour optimiser votre gestion.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Statistiques détaillées par expéditeur
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Analyse des taux d'ouverture
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Identification des emails les plus volumineux
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Suggestions de désabonnement
                  </li>
                </ul>
                <Button className="bg-gradient-to-r from-[#38c39d] to-[#2d8b61] rounded-full">
                  <ChartLine className="mr-2 h-4 w-4" />
                  Voir les statistiques
                </Button>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-[#38c39d] hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#38c39d] to-[#2d8b61] rounded-xl flex items-center justify-center mb-6">
                  <FolderOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Organisation automatique</h3>
                <p className="text-gray-600 mb-6">
                  Classez intelligemment vos emails en dossiers : factures, confirmations, voyages, promotions...
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    IA de classification automatique
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Dossiers pré-configurés (factures, voyages...)
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Règles personnalisables
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Apprentissage adaptatif
                  </li>
                </ul>
                <Button className="bg-gradient-to-r from-[#38c39d] to-[#2d8b61] rounded-full">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Organiser maintenant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="tableau-bord" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">Tableau de bord intelligent</h2>
              <p className="text-xl text-gray-600 mb-8">
                Suivez en temps réel l'impact écologique de votre nettoyage et accédez à des statistiques détaillées sur votre boîte mail.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-lg text-gray-700">
                  <Leaf className="text-[#38c39d] mr-4 h-5 w-5" />
                  Impact carbone économisé
                </li>
                <li className="flex items-center text-lg text-gray-700">
                  <BarChart3 className="text-[#38c39d] mr-4 h-5 w-5" />
                  Nombre d'emails traités
                </li>
                <li className="flex items-center text-lg text-gray-700">
                  <FolderOpen className="text-[#38c39d] mr-4 h-5 w-5" />
                  Espace de stockage libéré
                </li>
              </ul>

              <Button className="bg-gradient-to-r from-[#38c39d] to-[#2d8b61] rounded-full">
                <Eye className="mr-2 h-4 w-4" />
                Voir le tableau de bord
              </Button>
            </div>

            <Card className="shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8 pb-4 border-b">
                  <h4 className="text-xl font-semibold">Tableau de bord</h4>
                  <span className="text-green-500 flex items-center">
                    <Leaf className="mr-1 h-4 w-4" />
                    2.3kg CO₂ économisé
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#38c39d]">1,247</div>
                    <div className="text-sm text-gray-600">Emails supprimés</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#38c39d]">3.2 GB</div>
                    <div className="text-sm text-gray-600">Espace libéré</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#38c39d]">89%</div>
                    <div className="text-sm text-gray-600">Optimisation</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#38c39d]">24</div>
                    <div className="text-sm text-gray-600">Désabonnements</div>
                  </div>
                </div>

                <div className="h-32 bg-gradient-to-r from-[#38c39d]/20 to-[#2d8b61]/20 rounded-lg flex items-end justify-around p-4">
                  {[60, 80, 40, 90, 70, 50, 85].map((height, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-t from-[#38c39d] to-[#2d8b61] rounded-t w-4 transition-all duration-500 hover:scale-110"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Choisissez votre formule</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Gratuit</h3>
                <div className="text-4xl font-bold text-[#38c39d] mb-6">
                  0€<span className="text-lg text-gray-500">/mois</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Analyse de base
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    500 emails/mois
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    1 compte email
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Support communautaire
                  </li>
                </ul>
                <Button variant="outline" className="w-full rounded-full">Commencer</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#38c39d] transform scale-105 shadow-xl relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#38c39d] to-[#2d8b61] text-white px-6 py-1 rounded-full text-sm font-semibold">
                Populaire
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <div className="text-4xl font-bold text-[#38c39d] mb-6">
                  9€<span className="text-lg text-gray-500">/mois</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Analyse complète
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Emails illimités
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    5 comptes email
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Classification IA
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Support prioritaire
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-[#38c39d] to-[#2d8b61] rounded-full">
                  Choisir Pro
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Entreprise</h3>
                <div className="text-4xl font-bold text-[#38c39d] mb-6">
                  29€<span className="text-lg text-gray-500">/mois</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Fonctionnalités Pro
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Comptes illimités
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    API personnalisée
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Support dédié
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Formation équipe
                  </li>
                </ul>
                <Button variant="outline" className="w-full rounded-full">Nous contacter</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-10 duration-300">
            <CardContent className="p-8 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => closeModal('login')}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="text-center mb-6">
                <LogIn className="h-8 w-8 mx-auto mb-2 text-[#38c39d]" />
                <h3 className="text-2xl font-bold">Connexion</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button 
                  onClick={handleModalLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#38c39d] to-[#2d8b61] rounded-full disabled:opacity-50"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? "Connexion..." : "Se connecter avec Gmail"}
                </Button>
              </div>
              <p className="text-center mt-4 text-sm text-gray-600">
                Pas encore de compte ?{" "}
                <button 
                  onClick={() => switchModal('login', 'register')}
                  className="text-[#38c39d] font-medium hover:underline"
                >
                  Créer un compte
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-10 duration-300">
            <CardContent className="p-8 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => closeModal('register')}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="text-center mb-6">
                <UserPlus className="h-8 w-8 mx-auto mb-2 text-[#38c39d]" />
                <h3 className="text-2xl font-bold">Créer un compte</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <Input type="text" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button 
                  onClick={handleModalRegister}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#38c39d] to-[#2d8b61] rounded-full disabled:opacity-50"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Création..." : "Créer mon compte"}
                </Button>
              </div>
              <p className="text-center mt-4 text-sm text-gray-600">
                Déjà un compte ?{" "}
                <button 
                  onClick={() => switchModal('register', 'login')}
                  className="text-[#38c39d] font-medium hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModernLandingPage;

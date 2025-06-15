import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, Mail, Tag, FolderOpen, Trash2, Shield, UserMinus, Archive, 
         Briefcase, CreditCard, ShoppingBag, Plane, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface EmailGroup {
  sender: string;
  count: number;
  selected: boolean;
}

interface SenderStats {
  sender: string;
  emailCount: number;
  openRate: number;
  domain: string;
}

interface OrganizationCategory {
  name: string;
  icon: React.ReactNode;
  count: number;
  description: string;
  bgColor: string;
  borderColor: string;
}

interface OrganizationSender {
  sender: string;
  emailCount: number;
  category: string;
  selected: boolean;
  domain: string;
}

const ScanResults = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🚨 RÉCUPÉRATION DES VRAIES DONNÉES DU SCAN
  const scanResults = location.state?.scanResults;
  
  console.log('🔍 ScanResults - Données reçues:', {
    hasState: !!location.state,
    hasScanResults: !!scanResults,
    scanResultsKeys: scanResults ? Object.keys(scanResults) : 'aucune',
    totalEmails: scanResults?.totalEmails,
    emailsCount: scanResults?.emails?.length
  });

  // DEBUG VISIBLE DANS L'UI
  const [showDebug, setShowDebug] = useState(true);

  // Utiliser les vraies données si disponibles, sinon fallback sur des données par défaut
  const realTotalEmails = scanResults?.totalEmails || 0;
  const realEmailsArray = scanResults?.emails || [];
  const realSummary = scanResults?.summary || {};
  const realCarbonFootprint = scanResults?.carbonFootprint || 0;

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
  const [showUnreadEmails, setShowUnreadEmails] = useState(false);
  const [showOrganizeDetails, setShowOrganizeDetails] = useState(false);
  const [emailGroups, setEmailGroups] = useState<EmailGroup[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categorizationPage, setCategorizationPage] = useState(1);
  const [organizationPage, setOrganizationPage] = useState(1);
  const [senderStats, setSenderStats] = useState<SenderStats[]>([]);
  const [senderActions, setSenderActions] = useState<Record<string, string>>({});
  const [organizationSenders, setOrganizationSenders] = useState<OrganizationSender[]>([]);
  const [organizationSelectAll, setOrganizationSelectAll] = useState(true);
  const itemsPerPage = 50;

  // Configuration des catégories d'organisation
  const organizationCategories: OrganizationCategory[] = [
    {
      name: "💼 Administratif / Professionnel",
      icon: <Briefcase className="h-5 w-5" />,
      count: 487,
      description: "Contrats, RH, réunions, décisions stratégiques",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      name: "💳 Finance / Banque",
      icon: <CreditCard className="h-5 w-5" />,
      count: 623,
      description: "Factures importantes, prêts, assurances, fiscal",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      name: "🛍️ Achats Importants",
      icon: <ShoppingBag className="h-5 w-5" />,
      count: 389,
      description: "Garanties, SAV, remboursements",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      name: "✈️ Voyages & Justificatifs",
      icon: <Plane className="h-5 w-5" />,
      count: 234,
      description: "Déplacements professionnels, remboursements",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      name: "🔐 Sécurité & Accès",
      icon: <Lock className="h-5 w-5" />,
      count: 156,
      description: "Comptes, confirmations administratives",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  // Animation des statistiques au chargement avec les VRAIES données
  useEffect(() => {
    // Utiliser les vraies données ou des valeurs par défaut
    const targets = {
      totalEmails: realTotalEmails || 1000, // Utiliser les vraies données
      totalSpace: realCarbonFootprint ? (realCarbonFootprint / 1000 * 3.2) : 3.2,
      suggestedActions: Math.floor((realTotalEmails || 1000) * 0.66),
      co2Saveable: realCarbonFootprint ? (realCarbonFootprint / 100) : 89.3,
      unreadEmails: realSummary.oldUnreadEmails || Math.floor((realTotalEmails || 1000) * 0.25),
      categorizeEmails: realSummary.promotionalEmails || Math.floor((realTotalEmails || 1000) * 0.38),
      organizeEmails: realSummary.autoClassifiableEmails || Math.floor((realTotalEmails || 1000) * 0.15)
    };

    console.log('📊 Animation avec vraies données:', targets);

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
  }, [realTotalEmails, realCarbonFootprint, realSummary]);

  // Générer des données d'emails à partir des VRAIES données du scan
  useEffect(() => {
    if (realEmailsArray.length > 0) {
      // Grouper les vrais emails par expéditeur
      const emailsByDomain = realEmailsArray.reduce((acc: Record<string, number>, email: any) => {
        const domain = email.from || email.sender || 'unknown@domain.com';
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {});

      // Convertir en format EmailGroup
      const realEmailGroups: EmailGroup[] = Object.entries(emailsByDomain)
        .sort(([,a], [,b]) => b - a) // Trier par nombre décroissant
        .slice(0, 20) // Prendre les 20 premiers
        .map(([sender, count]) => ({
          sender,
          count,
          selected: true
        }));

      console.log('📧 Groupes d\'emails générés à partir des vraies données:', realEmailGroups);
      setEmailGroups(realEmailGroups);

      // Générer les stats des expéditeurs à partir des vraies données
      const realSenderStats: SenderStats[] = Object.entries(emailsByDomain)
        .filter(([, count]) => count > 1)
        .sort(([,a], [,b]) => b - a)
        .map(([sender, count]) => ({
          sender,
          emailCount: count,
          openRate: Math.random() * 80, // Simulation du taux d'ouverture
          domain: sender.split('@')[1] || sender
        }));

      setSenderStats(realSenderStats);
    } else {
      // Fallback sur des données factices si pas de vraies données
      console.log('⚠️ Aucune vraie donnée disponible, utilisation de données factices');
      // Données simulées pour la catégorisation - TOUS LES EMAILS avec plus d'un email par émetteur
      const mockAllSenderStats: SenderStats[] = [
        // E-commerce & Shopping
        { sender: "newsletters@amazon.fr", emailCount: 542, openRate: 12.5, domain: "amazon.fr" },
        { sender: "promo@zalando.fr", emailCount: 498, openRate: 8.3, domain: "zalando.fr" },
        { sender: "offers@cdiscount.fr", emailCount: 348, openRate: 9.1, domain: "cdiscount.fr" },
        { sender: "promo@darty.fr", emailCount: 235, openRate: 11.2, domain: "darty.fr" },
        { sender: "promo@fnac.fr", emailCount: 186, openRate: 14.6, domain: "fnac.fr" },
        { sender: "offers@groupon.fr", emailCount: 164, openRate: 6.8, domain: "groupon.fr" },
        { sender: "newsletter@vinted.fr", emailCount: 127, openRate: 22.4, domain: "vinted.fr" },
        { sender: "promo@leclerc.fr", emailCount: 98, openRate: 13.7, domain: "leclerc.fr" },
        
        // Réseaux sociaux & Communication
        { sender: "notifications@facebook.com", emailCount: 427, openRate: 23.1, domain: "facebook.com" },
        { sender: "newsletter@linkedin.com", emailCount: 343, openRate: 45.2, domain: "linkedin.com" },
        { sender: "updates@twitter.com", emailCount: 238, openRate: 19.4, domain: "twitter.com" },
        { sender: "updates@instagram.com", emailCount: 223, openRate: 61.2, domain: "instagram.com" },
        { sender: "notifications@youtube.com", emailCount: 189, openRate: 28.7, domain: "youtube.com" },
        { sender: "updates@pinterest.fr", emailCount: 156, openRate: 34.6, domain: "pinterest.fr" },
        { sender: "notifications@tiktok.com", emailCount: 134, openRate: 52.3, domain: "tiktok.com" },
        
        // Services & Applications
        { sender: "updates@spotify.com", emailCount: 295, openRate: 67.4, domain: "spotify.com" },
        { sender: "newsletter@uber.com", emailCount: 229, openRate: 52.1, domain: "uber.com" },
        { sender: "newsletter@deliveroo.fr", emailCount: 220, openRate: 38.5, domain: "deliveroo.fr" },
        { sender: "promo@booking.com", emailCount: 187, openRate: 18.9, domain: "booking.com" },
        { sender: "newsletter@airbnb.fr", emailCount: 141, openRate: 41.5, domain: "airbnb.fr" },
        { sender: "updates@netflix.com", emailCount: 98, openRate: 45.8, domain: "netflix.com" },
        { sender: "newsletter@blablacar.fr", emailCount: 87, openRate: 29.3, domain: "blablacar.fr" },
        
        // Actualités & Médias
        { sender: "news@lemonde.fr", emailCount: 276, openRate: 34.2, domain: "lemonde.fr" },
        { sender: "news@figaro.fr", emailCount: 245, openRate: 28.7, domain: "figaro.fr" },
        { sender: "news@bfmtv.com", emailCount: 232, openRate: 33.8, domain: "bfmtv.com" },
        { sender: "newsletter@20minutes.fr", emailCount: 198, openRate: 25.4, domain: "20minutes.fr" },
        { sender: "info@franceinfo.fr", emailCount: 167, openRate: 31.2, domain: "franceinfo.fr" },
        { sender: "newsletter@lequipe.fr", emailCount: 143, openRate: 42.7, domain: "lequipe.fr" },
        { sender: "news@liberation.fr", emailCount: 129, openRate: 37.8, domain: "liberation.fr" },
        
        // Petites annonces & Services locaux
        { sender: "info@leboncoin.fr", emailCount: 386, openRate: 15.7, domain: "leboncoin.fr" },
        { sender: "alerts@seloger.com", emailCount: 234, openRate: 27.9, domain: "seloger.com" },
        { sender: "newsletter@pap.fr", emailCount: 156, openRate: 21.3, domain: "pap.fr" },
        { sender: "info@logic-immo.com", emailCount: 143, openRate: 18.6, domain: "logic-immo.com" },
        
        // Tech & Professionnels
        { sender: "newsletter@medium.com", emailCount: 252, openRate: 72.3, domain: "medium.com" },
        { sender: "updates@github.com", emailCount: 198, openRate: 56.8, domain: "github.com" },
        { sender: "newsletter@stackoverflow.com", emailCount: 167, openRate: 43.2, domain: "stackoverflow.com" },
        { sender: "updates@slack.com", emailCount: 134, openRate: 38.9, domain: "slack.com" },
        
        // Banques & Services financiers
        { sender: "info@banquepopulaire.fr", emailCount: 198, openRate: 65.4, domain: "banquepopulaire.fr" },
        { sender: "alerts@creditagricole.fr", emailCount: 176, openRate: 58.7, domain: "creditagricole.fr" },
        { sender: "info@bnpparibas.net", emailCount: 165, openRate: 62.3, domain: "bnpparibas.net" },
        { sender: "newsletter@revolut.com", emailCount: 143, openRate: 44.6, domain: "revolut.com" },
        
        // Santé & Bien-être
        { sender: "newsletter@doctolib.fr", emailCount: 187, openRate: 76.2, domain: "doctolib.fr" },
        { sender: "info@ameli.fr", emailCount: 145, openRate: 82.4, domain: "ameli.fr" },
        { sender: "newsletter@yuka.io", emailCount: 123, openRate: 54.7, domain: "yuka.io" },
        
        // Gaming & Divertissement
        { sender: "newsletter@steam.com", emailCount: 234, openRate: 48.6, domain: "steam.com" },
        { sender: "updates@epicgames.com", emailCount: 189, openRate: 41.3, domain: "epicgames.com" },
        { sender: "newsletter@twitch.tv", emailCount: 156, openRate: 39.7, domain: "twitch.tv" },
        
        // Divers
        { sender: "newsletter@allocine.fr", emailCount: 167, openRate: 32.1, domain: "allocine.fr" },
        { sender: "info@pole-emploi.fr", emailCount: 145, openRate: 68.9, domain: "pole-emploi.fr" },
        { sender: "newsletter@marmiton.org", emailCount: 134, openRate: 41.8, domain: "marmiton.org" },
        { sender: "promo@sephora.fr", emailCount: 123, openRate: 26.4, domain: "sephora.fr" },
        { sender: "newsletter@ouest-france.fr", emailCount: 112, openRate: 29.6, domain: "ouest-france.fr" },
        { sender: "info@impots.gouv.fr", emailCount: 98, openRate: 89.2, domain: "impots.gouv.fr" },
        { sender: "newsletter@tf1.fr", emailCount: 87, openRate: 22.8, domain: "tf1.fr" },
        { sender: "promo@laposte.fr", emailCount: 76, openRate: 31.4, domain: "laposte.fr" },
        { sender: "newsletter@carrefour.fr", emailCount: 65, openRate: 15.2, domain: "carrefour.fr" },
        { sender: "info@caf.fr", emailCount: 54, openRate: 75.6, domain: "caf.fr" },
      ];
      
      // Filtrer pour ne garder que ceux avec plus d'un email et trier par nombre décroissant
      const filteredStats = realSenderStats.filter(sender => sender.emailCount > 1);
      filteredStats.sort((a, b) => b.emailCount - a.emailCount);
      setSenderStats(filteredStats);

      // Données simulées pour l'organisation intelligente
      const mockOrganizationSenders: OrganizationSender[] = [
        // Administratif / Professionnel
        { sender: "rh@entreprise.fr", emailCount: 45, category: "💼 Administratif / Professionnel", selected: true, domain: "entreprise.fr" },
        { sender: "contrats@avocat.fr", emailCount: 23, category: "💼 Administratif / Professionnel", selected: true, domain: "avocat.fr" },
        { sender: "direction@company.com", emailCount: 34, category: "💼 Administratif / Professionnel", selected: true, domain: "company.com" },
        
        // Finance / Banque
        { sender: "info@banquepopulaire.fr", emailCount: 87, category: "💳 Finance / Banque", selected: true, domain: "banquepopulaire.fr" },
        { sender: "factures@edf.fr", emailCount: 56, category: "💳 Finance / Banque", selected: true, domain: "edf.fr" },
        { sender: "assurance@axa.fr", emailCount: 43, category: "💳 Finance / Banque", selected: true, domain: "axa.fr" },
        { sender: "impots@dgfip.gouv.fr", emailCount: 12, category: "💳 Finance / Banque", selected: true, domain: "dgfip.gouv.fr" },
        
        // Achats Importants
        { sender: "commandes@apple.com", emailCount: 34, category: "🛍️ Achats Importants", selected: true, domain: "apple.com" },
        { sender: "sav@samsung.fr", emailCount: 23, category: "🛍️ Achats Importants", selected: true, domain: "samsung.fr" },
        { sender: "garantie@darty.fr", emailCount: 45, category: "🛍️ Achats Importants", selected: true, domain: "darty.fr" },
        
        // Voyages & Justificatifs
        { sender: "reservations@airfrance.fr", emailCount: 28, category: "✈️ Voyages & Justificatifs", selected: true, domain: "airfrance.fr" },
        { sender: "hotels@booking.com", emailCount: 34, category: "✈️ Voyages & Justificatifs", selected: true, domain: "booking.com" },
        { sender: "sncf@voyages-sncf.com", emailCount: 21, category: "✈️ Voyages & Justificatifs", selected: true, domain: "voyages-sncf.com" },
        
        // Sécurité & Accès
        { sender: "securite@banque.fr", emailCount: 15, category: "🔐 Sécurité & Accès", selected: true, domain: "banque.fr" },
        { sender: "verification@google.com", emailCount: 23, category: "🔐 Sécurité & Accès", selected: true, domain: "google.com" },
        { sender: "comptes@microsoft.com", emailCount: 18, category: "🔐 Sécurité & Accès", selected: true, domain: "microsoft.com" },
      ];
      
      setOrganizationSenders(mockOrganizationSenders);
    }, [realEmailsArray]);

  const handleUnreadEmails = () => {
    setShowUnreadEmails(true);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setEmailGroups(groups => 
      groups.map(group => ({ ...group, selected: newSelectAll }))
    );
  };

  const handleSelectNone = () => {
    setSelectAll(false);
    setEmailGroups(groups => 
      groups.map(group => ({ ...group, selected: false }))
    );
  };

  const handleGroupToggle = (senderEmail: string) => {
    setEmailGroups(groups => {
      const updatedGroups = groups.map(group => 
        group.sender === senderEmail 
          ? { ...group, selected: !group.selected }
          : group
      );
      
      const allSelected = updatedGroups.every(group => group.selected);
      setSelectAll(allSelected);
      
      return updatedGroups;
    });
  };

  const handleDeleteSelected = () => {
    const selectedGroups = emailGroups.filter(group => group.selected);
    const totalEmails = selectedGroups.reduce((sum, group) => sum + group.count, 0);
    
    console.log(`Suppression de ${totalEmails} emails de ${selectedGroups.length} expéditeurs`);
    
    setEmailGroups(groups => groups.filter(group => !group.selected));
  };

  const toggleCategoryOptions = () => {
    setCategoryOptionsVisible(!categoryOptionsVisible);
  };

  const handleSenderAction = (sender: string, action: string) => {
    setSenderActions(prev => ({ ...prev, [sender]: action }));
    console.log(`Action "${action}" sélectionnée pour ${sender}`);
  };

  const organizeEmails = () => {
    setShowOrganizeDetails(true);
  };

  // Nouvelles fonctions pour l'organisation
  const handleOrganizationSelectAll = () => {
    const newSelectAll = !organizationSelectAll;
    setOrganizationSelectAll(newSelectAll);
    setOrganizationSenders(senders => 
      senders.map(sender => ({ ...sender, selected: newSelectAll }))
    );
  };

  const handleOrganizationSenderToggle = (senderEmail: string) => {
    setOrganizationSenders(senders => {
      const updatedSenders = senders.map(sender => 
        sender.sender === senderEmail 
          ? { ...sender, selected: !sender.selected }
          : sender
      );
      
      const allSelected = updatedSenders.every(sender => sender.selected);
      setOrganizationSelectAll(allSelected);
      
      return updatedSenders;
    });
  };

  const applyOrganization = () => {
    const selectedSenders = organizationSenders.filter(sender => sender.selected);
    const totalEmails = selectedSenders.reduce((sum, sender) => sum + sender.emailCount, 0);
    
    console.log(`Organisation de ${totalEmails} emails de ${selectedSenders.length} expéditeurs`);
  };

  // Pagination des emails non lus
  const totalPages = Math.ceil(emailGroups.length / itemsPerPage);
  const paginatedEmails = emailGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination pour la catégorisation
  const totalCategorizationPages = Math.ceil(senderStats.length / itemsPerPage);
  const paginatedSenders = senderStats.slice(
    (categorizationPage - 1) * itemsPerPage,
    categorizationPage * itemsPerPage
  );

  // Pagination pour l'organisation
  const totalOrganizationPages = Math.ceil(organizationSenders.length / itemsPerPage);
  const paginatedOrganizationSenders = organizationSenders.slice(
    (organizationPage - 1) * itemsPerPage,
    organizationPage * itemsPerPage
  );

  const selectedCount = emailGroups.filter(group => group.selected).reduce((sum, group) => sum + group.count, 0);
  const totalEmails = emailGroups.reduce((sum, group) => sum + group.count, 0);
  const selectedOrganizationCount = organizationSenders.filter(sender => sender.selected).reduce((sum, sender) => sum + sender.emailCount, 0);

  const getOpenRateColor = (rate: number) => {
    if (rate >= 50) return "text-green-600";
    if (rate >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getActionButtonStyle = (sender: string, action: string) => {
    const isSelected = senderActions[sender] === action;
    const baseStyle = "px-3 py-1 text-xs rounded-full font-medium transition-all";
    
    switch (action) {
      case "keep":
        return `${baseStyle} ${isSelected ? "bg-green-500 text-white" : "bg-green-100 text-green-700 hover:bg-green-200"}`;
      case "unsubscribe":
        return `${baseStyle} ${isSelected ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`;
      case "delete":
        return `${baseStyle} ${isSelected ? "bg-red-500 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"}`;
      case "spam":
        return `${baseStyle} ${isSelected ? "bg-purple-500 text-white" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`;
      default:
        return baseStyle;
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryObj = organizationCategories.find(cat => cat.name === category);
    return categoryObj ? { bgColor: categoryObj.bgColor, borderColor: categoryObj.borderColor } : { bgColor: "bg-gray-50", borderColor: "border-gray-200" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#38c39d] to-[#2d8b61]">
      <Header 
        isAuthenticated={!!authState.userEmail}
        userEmail={authState.userEmail}
        onLogout={logout}
      />
      
      <div className="container mx-auto px-5 py-8 max-w-6xl">
        {/* DEBUG SECTION - Affichage des vraies données */}
        {showDebug && (
          <Card className="bg-yellow-100 border-2 border-yellow-300 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-yellow-800">🐛 DEBUG - Vraies Données du Scan</h2>
                <Button 
                  onClick={() => setShowDebug(false)}
                  variant="outline"
                  size="sm"
                >
                  Masquer Debug
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Scan Results:</strong> {scanResults ? '✅ Présent' : '❌ Absent'}
                </div>
                <div>
                  <strong>Total Emails:</strong> {realTotalEmails}
                </div>
                <div>
                  <strong>Emails Array:</strong> {realEmailsArray.length} emails
                </div>
                <div>
                  <strong>Carbon Footprint:</strong> {realCarbonFootprint}
                </div>
                <div>
                  <strong>Summary Keys:</strong> {Object.keys(realSummary).join(', ')}
                </div>
                <div>
                  <strong>Premier Email:</strong> {realEmailsArray[0]?.subject || 'Aucun'}
                </div>
              </div>
              
              {!scanResults && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                  <strong className="text-red-800">⚠️ PROBLÈME:</strong> Aucune donnée de scan trouvée dans location.state
                  <br />
                  <small>La navigation depuis le Dashboard ne transmet pas les données du scan</small>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

        {/* Résumé du scan avec VRAIES données */}
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
                🔍 Voyons cela de plus près
              </Button>
            </CardContent>
          </Card>

          {/* Section détaillée des emails non ouverts */}
          {showUnreadEmails && (
            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Emails non ouverts depuis 6 mois</h3>
                  <p className="text-gray-600">
                    {totalEmails.toLocaleString()} emails trouvés, groupés par expéditeur
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex gap-3">
                    <Button onClick={handleSelectAll} variant="outline">
                      Tout sélectionner
                    </Button>
                    <Button onClick={handleSelectNone} variant="outline">
                      Tout désélectionner
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {selectedCount.toLocaleString()} emails sélectionnés
                    </span>
                    <Button
                      onClick={handleDeleteSelected}
                      disabled={selectedCount === 0}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer sélection
                    </Button>
                  </div>
                </div>

                {/* Liste des expéditeurs */}
                <div className="space-y-3 mb-6">
                  {paginatedEmails.map((group) => (
                    <div key={group.sender} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={group.selected}
                          onCheckedChange={() => handleGroupToggle(group.sender)}
                        />
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-800">{group.sender}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-500">{group.count}</span>
                        <span className="text-sm text-gray-600">emails</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={page === currentPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                      Tous vos emails regroupés par émetteur (avec plus d'un email) nécessitent votre attention pour décider s'il faut les conserver, vous désabonner, les supprimer ou les marquer comme spam.
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white px-4 py-2 rounded-full font-semibold">
                  -28.7 kg CO₂
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">2,523</span>
                  <div className="text-gray-600 text-sm mt-1">E-commerce</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">1,487</span>
                  <div className="text-gray-600 text-sm mt-1">Réseaux sociaux</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xl font-bold text-gray-800 block">846</span>
                  <div className="text-gray-600 text-sm mt-1">Actualités</div>
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
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-gray-800">Tous les emails classés par émetteur</h4>
                    <p className="text-sm text-gray-600">
                      {senderStats.length} émetteurs trouvés avec plus d'un email (trié par nombre d'emails décroissant)
                    </p>
                  </div>
                  
                  {/* En-têtes du tableau */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 rounded-lg font-semibold text-sm text-gray-700 mb-4">
                    <div className="col-span-4">Émetteur</div>
                    <div className="col-span-2 text-center">Nb emails</div>
                    <div className="col-span-2 text-center">Taux ouverture</div>
                    <div className="col-span-4 text-center">Actions</div>
                  </div>
                  
                  {/* Liste des émetteurs */}
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {paginatedSenders.map((sender) => (
                      <div key={sender.sender} className="grid grid-cols-12 gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="col-span-4">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-800 text-sm truncate">{sender.sender}</div>
                              <div className="text-xs text-gray-500">{sender.domain}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <span className="font-bold text-gray-800">{sender.emailCount}</span>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <span className={`font-semibold ${getOpenRateColor(sender.openRate)}`}>
                            {sender.openRate}%
                          </span>
                        </div>
                        
                        <div className="col-span-4">
                          <div className="flex gap-2 justify-center flex-wrap">
                            <button
                              onClick={() => handleSenderAction(sender.sender, "keep")}
                              className={getActionButtonStyle(sender.sender, "keep")}
                              title="Conserver"
                            >
                              <Archive className="h-3 w-3 mr-1 inline" />
                              Conserver
                            </button>
                            <button
                              onClick={() => handleSenderAction(sender.sender, "unsubscribe")}
                              className={getActionButtonStyle(sender.sender, "unsubscribe")}
                              title="Désabonner & supprimer"
                            >
                              <UserMinus className="h-3 w-3 mr-1 inline" />
                              Désabonner
                            </button>
                            <button
                              onClick={() => handleSenderAction(sender.sender, "delete")}
                              className={getActionButtonStyle(sender.sender, "delete")}
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3 mr-1 inline" />
                              Supprimer
                            </button>
                            <button
                              onClick={() => handleSenderAction(sender.sender, "spam")}
                              className={getActionButtonStyle(sender.sender, "spam")}
                              title="Spam et supprimer"
                            >
                              <Shield className="h-3 w-3 mr-1 inline" />
                              Spam
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination pour la catégorisation */}
                  {totalCategorizationPages > 1 && (
                    <div className="flex justify-center mb-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationPrevious
                            onClick={() => setCategorizationPage(Math.max(1, categorizationPage - 1))}
                            className={categorizationPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                          {Array.from({ length: Math.min(5, totalCategorizationPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCategorizationPage(page)}
                                  isActive={page === categorizationPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          <PaginationNext
                            onClick={() => setCategorizationPage(Math.min(totalCategorizationPages, categorizationPage + 1))}
                            className={categorizationPage === totalCategorizationPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}

                  {/* Résumé des actions sélectionnées */}
                  {Object.keys(senderActions).length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-2">Actions sélectionnées :</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <span className="block font-bold text-green-600">
                            {Object.values(senderActions).filter(action => action === "keep").length}
                          </span>
                          <span className="text-green-700">À conserver</span>
                        </div>
                        <div className="text-center">
                          <span className="block font-bold text-orange-600">
                            {Object.values(senderActions).filter(action => action === "unsubscribe").length}
                          </span>
                          <span className="text-orange-700">Désabonnements</span>
                        </div>
                        <div className="text-center">
                          <span className="block font-bold text-red-600">
                            {Object.values(senderActions).filter(action => action === "delete").length}
                          </span>
                          <span className="text-red-700">Suppressions</span>
                        </div>
                        <div className="text-center">
                          <span className="block font-bold text-purple-600">
                            {Object.values(senderActions).filter(action => action === "spam").length}
                          </span>
                          <span className="text-purple-700">Spam</span>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                          Appliquer les actions sélectionnées
                        </Button>
                      </div>
                    </div>
                  )}
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
              
              {/* Grille des 5 catégories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {organizationCategories.map((category, index) => (
                  <div key={index} className={`p-4 rounded-xl border-2 ${category.bgColor} ${category.borderColor}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {category.icon}
                      <span className="font-semibold text-gray-800">{category.name}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">{category.count.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{category.description}</div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={organizeEmails}
                className="w-full bg-gradient-to-r from-[#A8E6CF] to-[#7FCDCD] text-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg py-4 rounded-2xl"
              >
                📂 Organiser Automatiquement
              </Button>
              
              {/* Vue détaillée par émetteur */}
              {showOrganizeDetails && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-gray-800">Détail par émetteur</h4>
                    <p className="text-sm text-gray-600">
                      {organizationSenders.length} émetteurs trouvés
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex gap-3">
                      <Button onClick={handleOrganizationSelectAll} variant="outline">
                        {organizationSelectAll ? "Tout désélectionner" : "Tout sélectionner"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {selectedOrganizationCount.toLocaleString()} emails sélectionnés
                      </span>
                      <Button
                        onClick={applyOrganization}
                        disabled={selectedOrganizationCount === 0}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Organiser sélection
                      </Button>
                    </div>
                  </div>

                  {/* En-têtes du tableau */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 rounded-lg font-semibold text-sm text-gray-700 mb-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-4">Émetteur</div>
                    <div className="col-span-2 text-center">Nb emails</div>
                    <div className="col-span-5">Catégorie</div>
                  </div>
                  
                  {/* Liste des émetteurs */}
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {paginatedOrganizationSenders.map((sender) => {
                      const colors = getCategoryColor(sender.category);
                      return (
                        <div key={sender.sender} className={`grid grid-cols-12 gap-4 p-4 ${colors.bgColor} rounded-lg border ${colors.borderColor} hover:shadow-md transition-all`}>
                          <div className="col-span-1 flex items-center">
                            <Checkbox
                              checked={sender.selected}
                              onCheckedChange={() => handleOrganizationSenderToggle(sender.sender)}
                            />
                          </div>
                          
                          <div className="col-span-4">
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-800 text-sm truncate">{sender.sender}</div>
                                <div className="text-xs text-gray-500">{sender.domain}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-2 text-center flex items-center justify-center">
                            <span className="font-bold text-gray-800">{sender.emailCount}</span>
                          </div>
                          
                          <div className="col-span-5 flex items-center">
                            <div className="flex items-center gap-2">
                              {organizationCategories.find(cat => cat.name === sender.category)?.icon}
                              <span className="text-sm font-medium text-gray-700">{sender.category}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination pour l'organisation */}
                  {totalOrganizationPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationPrevious
                            onClick={() => setOrganizationPage(Math.max(1, organizationPage - 1))}
                            className={organizationPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                          {Array.from({ length: Math.min(5, totalOrganizationPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setOrganizationPage(page)}
                                  isActive={page === organizationPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          <PaginationNext
                            onClick={() => setOrganizationPage(Math.min(totalOrganizationPages, organizationPage + 1))}
                            className={organizationPage === totalOrganizationPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section de progression */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg mt-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🌱 Progression vers un Email Plus Vert</h2>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4 relative">
              <div 
                className="h-full bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-full transition-all duration-[3s] ease-out"
                style={{ width: '75%' }}
              ></div>
            </div>
            <div className="text-lg text-gray-600">
              En appliquant toutes ces actions, vous économiserez <strong>79.2 kg de CO₂</strong> et libérerez <strong>2.1 GB d'espace</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ScanResults;

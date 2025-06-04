
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, Mail, Tag, FolderOpen, Trash2, Shield, Unsubscribe, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const ScanResults = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
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
  const [emailGroups, setEmailGroups] = useState<EmailGroup[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categorizationPage, setCategorizationPage] = useState(1);
  const [senderStats, setSenderStats] = useState<SenderStats[]>([]);
  const [senderActions, setSenderActions] = useState<Record<string, string>>({});
  const itemsPerPage = 50;

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

  // Données simulées d'emails groupés par expéditeur
  useEffect(() => {
    const mockEmailGroups: EmailGroup[] = [
      { sender: "newsletters@amazon.fr", count: 342, selected: true },
      { sender: "promo@zalando.fr", count: 298, selected: true },
      { sender: "info@leboncoin.fr", count: 186, selected: true },
      { sender: "newsletter@linkedin.com", count: 143, selected: true },
      { sender: "notifications@facebook.com", count: 127, selected: true },
      { sender: "updates@spotify.com", count: 95, selected: true },
      { sender: "promo@booking.com", count: 87, selected: true },
      { sender: "news@lemonde.fr", count: 76, selected: true },
      { sender: "offers@groupon.fr", count: 64, selected: true },
      { sender: "newsletter@medium.com", count: 52, selected: true },
      { sender: "promo@cdiscount.fr", count: 48, selected: true },
      { sender: "news@figaro.fr", count: 45, selected: true },
      { sender: "newsletter@airbnb.fr", count: 41, selected: true },
      { sender: "updates@twitter.com", count: 38, selected: true },
      { sender: "promo@darty.fr", count: 35, selected: true },
      { sender: "news@bfmtv.com", count: 32, selected: true },
      { sender: "newsletter@uber.com", count: 29, selected: true },
      { sender: "promo@fnac.fr", count: 26, selected: true },
      { sender: "updates@instagram.com", count: 23, selected: true },
      { sender: "newsletter@deliveroo.fr", count: 20, selected: true },
    ];
    setEmailGroups(mockEmailGroups);

    // Données simulées pour la catégorisation
    const mockSenderStats: SenderStats[] = [
      { sender: "newsletters@amazon.fr", emailCount: 342, openRate: 12.5, domain: "amazon.fr" },
      { sender: "promo@zalando.fr", emailCount: 298, openRate: 8.3, domain: "zalando.fr" },
      { sender: "info@leboncoin.fr", emailCount: 186, openRate: 15.7, domain: "leboncoin.fr" },
      { sender: "newsletter@linkedin.com", emailCount: 143, openRate: 45.2, domain: "linkedin.com" },
      { sender: "notifications@facebook.com", emailCount: 127, openRate: 23.1, domain: "facebook.com" },
      { sender: "updates@spotify.com", emailCount: 95, openRate: 67.4, domain: "spotify.com" },
      { sender: "promo@booking.com", emailCount: 87, openRate: 18.9, domain: "booking.com" },
      { sender: "news@lemonde.fr", emailCount: 76, openRate: 34.2, domain: "lemonde.fr" },
      { sender: "offers@groupon.fr", emailCount: 64, openRate: 6.8, domain: "groupon.fr" },
      { sender: "newsletter@medium.com", emailCount: 52, openRate: 72.3, domain: "medium.com" },
      { sender: "promo@cdiscount.fr", emailCount: 48, openRate: 9.1, domain: "cdiscount.fr" },
      { sender: "news@figaro.fr", emailCount: 45, openRate: 28.7, domain: "figaro.fr" },
      { sender: "newsletter@airbnb.fr", emailCount: 41, openRate: 41.5, domain: "airbnb.fr" },
      { sender: "updates@twitter.com", emailCount: 38, openRate: 19.4, domain: "twitter.com" },
      { sender: "promo@darty.fr", emailCount: 35, openRate: 11.2, domain: "darty.fr" },
      { sender: "news@bfmtv.com", emailCount: 32, openRate: 33.8, domain: "bfmtv.com" },
      { sender: "newsletter@uber.com", emailCount: 29, openRate: 52.1, domain: "uber.com" },
      { sender: "promo@fnac.fr", emailCount: 26, openRate: 14.6, domain: "fnac.fr" },
      { sender: "updates@instagram.com", emailCount: 23, openRate: 61.2, domain: "instagram.com" },
      { sender: "newsletter@deliveroo.fr", emailCount: 20, openRate: 38.5, domain: "deliveroo.fr" },
    ];
    
    // Trier par nombre d'emails décroissant
    mockSenderStats.sort((a, b) => b.emailCount - a.emailCount);
    setSenderStats(mockSenderStats);
  }, []);

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
    console.log("Organisation des emails...");
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

  const selectedCount = emailGroups.filter(group => group.selected).reduce((sum, group) => sum + group.count, 0);
  const totalEmails = emailGroups.reduce((sum, group) => sum + group.count, 0);

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
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-gray-800">Emails classés par émetteur</h4>
                    <p className="text-sm text-gray-600">
                      {senderStats.length} émetteurs trouvés (trié par nombre d'emails décroissant)
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
                              <Unsubscribe className="h-3 w-3 mr-1 inline" />
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

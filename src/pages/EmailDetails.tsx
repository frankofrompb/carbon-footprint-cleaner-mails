
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Trash2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmailGroup {
  sender: string;
  count: number;
  emails: {
    id: string;
    subject: string;
    date: string;
    size: number;
  }[];
  selected: boolean;
}

const EmailDetails = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [emailGroups, setEmailGroups] = useState<EmailGroup[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // Données simulées d'emails groupés par expéditeur
  useEffect(() => {
    const mockEmailGroups: EmailGroup[] = [
      {
        sender: "newsletters@amazon.fr",
        count: 342,
        emails: [
          { id: "1", subject: "Offres du jour Amazon", date: "2024-01-15", size: 45000 },
          { id: "2", subject: "Recommandations pour vous", date: "2024-01-10", size: 38000 },
          { id: "3", subject: "Ventes flash du weekend", date: "2024-01-05", size: 52000 },
        ],
        selected: true
      },
      {
        sender: "promo@zalando.fr",
        count: 298,
        emails: [
          { id: "4", subject: "Soldes jusqu'à -70%", date: "2024-01-20", size: 42000 },
          { id: "5", subject: "Nouvelle collection printemps", date: "2024-01-18", size: 48000 },
        ],
        selected: true
      },
      {
        sender: "info@leboncoin.fr",
        count: 186,
        emails: [
          { id: "6", subject: "Vos alertes immobilier", date: "2024-01-22", size: 25000 },
          { id: "7", subject: "Nouvelles annonces près de chez vous", date: "2024-01-19", size: 31000 },
        ],
        selected: true
      },
      {
        sender: "newsletter@linkedin.com",
        count: 143,
        emails: [
          { id: "8", subject: "Votre résumé hebdomadaire", date: "2024-01-21", size: 35000 },
          { id: "9", subject: "Nouvelles de votre réseau", date: "2024-01-14", size: 28000 },
        ],
        selected: true
      },
      {
        sender: "notifications@facebook.com",
        count: 127,
        emails: [
          { id: "10", subject: "Vous avez 5 nouvelles notifications", date: "2024-01-23", size: 15000 },
        ],
        selected: true
      }
    ];
    setEmailGroups(mockEmailGroups);
  }, []);

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
      
      // Mettre à jour l'état "tout sélectionné"
      const allSelected = updatedGroups.every(group => group.selected);
      setSelectAll(allSelected);
      
      return updatedGroups;
    });
  };

  const handleDeleteSelected = () => {
    const selectedGroups = emailGroups.filter(group => group.selected);
    const totalEmails = selectedGroups.reduce((sum, group) => sum + group.count, 0);
    
    console.log(`Suppression de ${totalEmails} emails de ${selectedGroups.length} expéditeurs`);
    // Ici, vous ajouteriez la logique de suppression réelle
    
    // Simulation de retour à la page précédente après suppression
    setTimeout(() => {
      navigate('/scan-results');
    }, 1000);
  };

  const selectedCount = emailGroups.filter(group => group.selected).reduce((sum, group) => sum + group.count, 0);
  const totalEmails = emailGroups.reduce((sum, group) => sum + group.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#38c39d] to-[#2d8b61]">
      <Header 
        isAuthenticated={!!authState.userEmail}
        userEmail={authState.userEmail}
        onLogout={logout}
      />
      
      <div className="container mx-auto px-5 py-8 max-w-6xl">
        {/* Header avec retour */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => navigate('/scan-results')}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Emails non ouverts depuis 6 mois</h1>
            </div>
            <p className="text-gray-600">
              Voici le détail de vos {totalEmails.toLocaleString()} emails non ouverts, groupés par expéditeur.
            </p>
          </CardContent>
        </Card>

        {/* Actions en haut */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
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
                  {selectedCount.toLocaleString()} emails sélectionnés sur {totalEmails.toLocaleString()}
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
          </CardContent>
        </Card>

        {/* Liste des expéditeurs */}
        <div className="space-y-4">
          {emailGroups.map((group) => (
            <Card key={group.sender} className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={group.selected}
                      onCheckedChange={() => handleGroupToggle(group.sender)}
                    />
                    <div>
                      <CardTitle className="text-lg">{group.sender}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {group.count} emails • Dernière activité il y a plus de 6 mois
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">{group.count}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">Exemples d'emails :</p>
                  {group.emails.slice(0, 3).map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(email.date).toLocaleDateString('fr-FR')} • {(email.size / 1024).toFixed(1)} Ko
                        </p>
                      </div>
                    </div>
                  ))}
                  {group.emails.length > 3 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      ... et {group.count - 3} autres emails
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Résumé en bas */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Impact environnemental</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-2xl font-bold text-red-500">{selectedCount.toLocaleString()}</span>
                <p className="text-sm text-gray-600">Emails à supprimer</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-500">
                  {(selectedCount * 0.01).toFixed(1)} MB
                </span>
                <p className="text-sm text-gray-600">Espace libéré</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-500">
                  {(selectedCount * 0.004).toFixed(2)} kg
                </span>
                <p className="text-sm text-gray-600">CO₂ économisé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default EmailDetails;

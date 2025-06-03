
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
        selected: true
      },
      {
        sender: "promo@zalando.fr",
        count: 298,
        selected: true
      },
      {
        sender: "info@leboncoin.fr",
        count: 186,
        selected: true
      },
      {
        sender: "newsletter@linkedin.com",
        count: 143,
        selected: true
      },
      {
        sender: "notifications@facebook.com",
        count: 127,
        selected: true
      },
      {
        sender: "updates@spotify.com",
        count: 95,
        selected: true
      },
      {
        sender: "promo@booking.com",
        count: 87,
        selected: true
      },
      {
        sender: "news@lemonde.fr",
        count: 76,
        selected: true
      },
      {
        sender: "offers@groupon.fr",
        count: 64,
        selected: true
      },
      {
        sender: "newsletter@medium.com",
        count: 52,
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

        {/* Liste simplifiée des expéditeurs */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Expéditeurs avec emails non ouverts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emailGroups.map((group) => (
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
          </CardContent>
        </Card>

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

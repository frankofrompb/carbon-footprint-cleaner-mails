import { ScanResults, EmailData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FolderPlus, Eye, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AutoFolderOrganizationSectionProps {
  results: ScanResults;
}

interface FolderSuggestion {
  folderName: string;
  emails: EmailData[];
  description: string;
  color: string;
  icon: string;
}

const AutoFolderOrganizationSection = ({ results }: AutoFolderOrganizationSectionProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { toast } = useToast();

  // Classifier automatiquement les emails par catégories pour l'organisation en dossiers
  const categorizeEmails = (): FolderSuggestion[] => {
    const folders: FolderSuggestion[] = [];

    // 1. Factures et finances
    const billEmails = results.emails.filter(email => {
      const subject = email.subject.toLowerCase();
      const from = email.from.toLowerCase();
      return subject.includes('facture') || 
             subject.includes('invoice') || 
             subject.includes('payment') || 
             subject.includes('bill') ||
             from.includes('bank') ||
             from.includes('paypal') ||
             from.includes('stripe') ||
             subject.includes('reçu') ||
             subject.includes('receipt');
    });

    if (billEmails.length > 0) {
      folders.push({
        folderName: "💳 Factures & Finances",
        emails: billEmails,
        description: "Factures, reçus, notifications bancaires",
        color: "bg-green-50 border-green-200",
        icon: "💳"
      });
    }

    // 2. Réservations et voyages
    const travelEmails = results.emails.filter(email => {
      const subject = email.subject.toLowerCase();
      const from = email.from.toLowerCase();
      return subject.includes('reservation') || 
             subject.includes('booking') || 
             subject.includes('confirmation') ||
             subject.includes('hotel') ||
             subject.includes('vol') ||
             subject.includes('flight') ||
             from.includes('booking.com') ||
             from.includes('airbnb') ||
             from.includes('sncf') ||
             subject.includes('voyage');
    });

    if (travelEmails.length > 0) {
      folders.push({
        folderName: "✈️ Réservations & Voyages",
        emails: travelEmails,
        description: "Confirmations de réservations, billets, hôtels",
        color: "bg-blue-50 border-blue-200",
        icon: "✈️"
      });
    }

    // 3. Administratif et officiel
    const adminEmails = results.emails.filter(email => {
      const subject = email.subject.toLowerCase();
      const from = email.from.toLowerCase();
      return subject.includes('administratif') || 
             subject.includes('officiel') || 
             subject.includes('contrat') ||
             subject.includes('assurance') ||
             subject.includes('impôt') ||
             subject.includes('tax') ||
             from.includes('.gouv.') ||
             from.includes('prefecture') ||
             subject.includes('document officiel');
    });

    if (adminEmails.length > 0) {
      folders.push({
        folderName: "🏛️ Administratif",
        emails: adminEmails,
        description: "Documents officiels, contrats, assurances",
        color: "bg-purple-50 border-purple-200",
        icon: "🏛️"
      });
    }

    // 4. Shopping et commandes
    const shoppingEmails = results.emails.filter(email => {
      const subject = email.subject.toLowerCase();
      const from = email.from.toLowerCase();
      return subject.includes('commande') || 
             subject.includes('order') || 
             subject.includes('livraison') ||
             subject.includes('delivery') ||
             from.includes('amazon') ||
             from.includes('ebay') ||
             from.includes('zalando') ||
             subject.includes('expédié') ||
             subject.includes('shipped');
    });

    if (shoppingEmails.length > 0) {
      folders.push({
        folderName: "🛒 Achats & Commandes",
        emails: shoppingEmails,
        description: "Confirmations de commandes, livraisons, achats",
        color: "bg-orange-50 border-orange-200",
        icon: "🛒"
      });
    }

    // 5. Newsletters et promotions
    const promotionalEmails = results.emails.filter(email => {
      const subject = email.subject.toLowerCase();
      return email.classification?.category === 'promotional' ||
             subject.includes('newsletter') ||
             subject.includes('promo') ||
             subject.includes('offer') ||
             subject.includes('sale') ||
             subject.includes('discount');
    });

    if (promotionalEmails.length > 0) {
      folders.push({
        folderName: "📢 Newsletters & Promos",
        emails: promotionalEmails,
        description: "Newsletters, promotions, offres commerciales",
        color: "bg-yellow-50 border-yellow-200",
        icon: "📢"
      });
    }

    // 6. Réseaux sociaux
    const socialEmails = results.emails.filter(email => {
      return email.classification?.category === 'social';
    });

    if (socialEmails.length > 0) {
      folders.push({
        folderName: "👥 Réseaux Sociaux",
        emails: socialEmails,
        description: "Notifications des réseaux sociaux",
        color: "bg-pink-50 border-pink-200",
        icon: "👥"
      });
    }

    return folders;
  };

  const folderSuggestions = categorizeEmails();

  const handleCreateFolder = (folder: FolderSuggestion) => {
    // Note: Dans une vraie implémentation, ceci appellerait l'API Gmail pour créer le label/dossier
    toast({
      title: "Fonctionnalité en développement",
      description: `La création automatique du dossier "${folder.folderName}" avec ${folder.emails.length} emails sera bientôt disponible.`,
    });
  };

  const calculateTotalEmails = () => {
    return folderSuggestions.reduce((total, folder) => total + folder.emails.length, 0);
  };

  if (folderSuggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📁 Organisation automatique en dossiers
            <Badge variant="outline">Aucune suggestion</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Aucune catégorie d'emails suffisamment importante trouvée pour suggérer une organisation en dossiers.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📁 Organisation automatique en dossiers
          <Badge variant="outline">{folderSuggestions.length} dossiers suggérés</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Organisation intelligente :</strong> {calculateTotalEmails()} emails peuvent être automatiquement organisés 
              en {folderSuggestions.length} dossiers thématiques.
            </p>
          </div>

          <div className="grid gap-4">
            {folderSuggestions.map((folder) => (
              <Card key={folder.folderName} className={`${folder.color} transition-all duration-200 hover:shadow-md`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{folder.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{folder.folderName}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{folder.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {folder.emails.length} emails
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFolder(
                          selectedFolder === folder.folderName ? null : folder.folderName
                        )}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="default" size="sm">
                            <FolderPlus className="h-3 w-3 mr-1" />
                            Créer
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Créer le dossier "{folder.folderName}" ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action créera automatiquement un nouveau dossier dans Gmail et y déplacera 
                              {folder.emails.length} emails correspondants.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCreateFolder(folder)}>
                              Créer le dossier
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                {selectedFolder === folder.folderName && (
                  <CardContent className="pt-0">
                    <div className="bg-white rounded-lg p-3 border">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Aperçu des emails qui seraient déplacés :
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Expéditeur</TableHead>
                            <TableHead>Sujet</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {folder.emails.slice(0, 5).map((email) => (
                            <TableRow key={email.id}>
                              <TableCell className="max-w-[150px] truncate text-sm">
                                {email.from}
                              </TableCell>
                              <TableCell className="max-w-[250px] truncate text-sm">
                                {email.subject}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(email.date).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {folder.emails.length > 5 && (
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          ... et {folder.emails.length - 5} autres emails
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-2">🔧 Fonctionnalités à venir :</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Création automatique des dossiers Gmail</li>
              <li>• Déplacement en lot des emails vers les dossiers appropriés</li>
              <li>• Règles automatiques pour les futurs emails</li>
              <li>• Personnalisation des catégories</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoFolderOrganizationSection;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Mail, Archive } from "lucide-react";
import { ScanResults } from "@/types";

interface AutoOrganizationSectionProps {
  results: ScanResults;
  onOrganizeSelected: (emailIds: string[]) => void;
}

const AutoOrganizationSection = ({ results, onOrganizeSelected }: AutoOrganizationSectionProps) => {
  // Catégories spécifiques pour l'organisation
  const organizationCategories = {
    'invoices_receipts': 'Factures & Reçus',
    'travel_reservations': 'Voyages / Réservations', 
    'banking_finance': 'Banque & Finances',
    'orders_delivery': 'Commandes & Livraisons',
    'administrative_official': 'Administratif / Officiel',
    'subscriptions_digital': 'Abonnements & Services numériques',
    'insurance_health': 'Assurances / Mutuelle'
  };

  // Mapper les catégories existantes vers les catégories d'organisation
  const mapToOrganizationCategory = (category: string, subject: string, from: string) => {
    const lowerSubject = subject.toLowerCase();
    const lowerFrom = from.toLowerCase();
    
    if (lowerSubject.includes('facture') || lowerSubject.includes('reçu') || lowerSubject.includes('invoice')) {
      return 'invoices_receipts';
    }
    if (lowerSubject.includes('voyage') || lowerSubject.includes('booking') || lowerSubject.includes('réservation') || 
        lowerFrom.includes('booking') || lowerFrom.includes('airbnb') || lowerFrom.includes('hotel')) {
      return 'travel_reservations';
    }
    if (lowerFrom.includes('bank') || lowerFrom.includes('banque') || lowerSubject.includes('virement') || 
        lowerSubject.includes('compte')) {
      return 'banking_finance';
    }
    if (lowerSubject.includes('commande') || lowerSubject.includes('livraison') || lowerSubject.includes('expédié') ||
        lowerFrom.includes('amazon') || lowerFrom.includes('shop') || category === 'order_confirmation') {
      return 'orders_delivery';
    }
    if (lowerSubject.includes('administratif') || lowerSubject.includes('officiel') || lowerSubject.includes('impôt')) {
      return 'administrative_official';
    }
    if (category === 'newsletter' || lowerSubject.includes('abonnement') || lowerSubject.includes('subscription')) {
      return 'subscriptions_digital';
    }
    if (lowerSubject.includes('assurance') || lowerSubject.includes('mutuelle') || lowerSubject.includes('santé')) {
      return 'insurance_health';
    }
    return null;
  };

  // Grouper les emails par catégorie d'organisation et expéditeur
  const emailsByCategory = results.emails.reduce((acc, email) => {
    const orgCategory = mapToOrganizationCategory(
      email.classification?.category || 'other', 
      email.subject, 
      email.from
    );
    
    if (!orgCategory) return acc;
    
    if (!acc[orgCategory]) {
      acc[orgCategory] = {};
    }
    
    const sender = email.from;
    if (!acc[orgCategory][sender]) {
      acc[orgCategory][sender] = {
        emails: [],
        count: 0
      };
    }
    
    acc[orgCategory][sender].emails.push(email);
    acc[orgCategory][sender].count++;
    
    return acc;
  }, {} as Record<string, Record<string, { emails: any[], count: number }>>);

  const handleOrganizeSender = (emails: any[]) => {
    const emailIds = emails.map(email => email.id);
    onOrganizeSelected(emailIds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-green-600" />
          Organisation automatique
        </CardTitle>
        <p className="text-sm text-gray-600">
          Classification par catégories spécifiques pour une organisation optimale
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(organizationCategories).map(([categoryKey, categoryLabel]) => {
            const categoryData = emailsByCategory[categoryKey];
            if (!categoryData) return null;
            
            const senderEntries = Object.entries(categoryData)
              .sort(([,a], [,b]) => b.count - a.count);
            
            const totalEmails = senderEntries.reduce((sum, [,data]) => sum + data.count, 0);
            
            return (
              <div key={categoryKey} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    {categoryLabel}
                  </h4>
                  <Badge variant="secondary">{totalEmails} emails</Badge>
                </div>
                
                <div className="space-y-2">
                  {senderEntries.map(([sender, data]) => (
                    <div key={sender} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm truncate">{sender}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{data.count} emails</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrganizeSender(data.emails)}
                          className="text-xs"
                        >
                          Organiser
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoOrganizationSection;

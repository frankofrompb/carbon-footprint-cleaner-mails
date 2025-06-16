
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Clock } from "lucide-react";
import { ScanResults } from "@/types";

interface SmartDeletionSectionProps {
  results: ScanResults;
  onDeleteSelected: (emailIds: string[]) => void;
}

const SmartDeletionSection = ({ results, onDeleteSelected }: SmartDeletionSectionProps) => {
  // Filtrer les emails non ouverts depuis plus de 6 mois
  const oldUnreadEmails = results.emails.filter(email => {
    const daysSince = email.daysSinceReceived || 0;
    return daysSince > 180 && email.isUnread;
  });

  // Grouper par expéditeur
  const emailsBySender = oldUnreadEmails.reduce((acc, email) => {
    const sender = email.from;
    if (!acc[sender]) {
      acc[sender] = {
        emails: [],
        count: 0,
        category: email.classification?.category || 'other'
      };
    }
    acc[sender].emails.push(email);
    acc[sender].count++;
    return acc;
  }, {} as Record<string, { emails: any[], count: number, category: string }>);

  const senderEntries = Object.entries(emailsBySender)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 20);

  const handleDeleteSender = (senderEmails: any[]) => {
    const emailIds = senderEmails.map(email => email.id);
    onDeleteSelected(emailIds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          Suppression intelligente
        </CardTitle>
        <p className="text-sm text-gray-600">
          Emails non ouverts depuis plus de 6 mois - {oldUnreadEmails.length} emails trouvés
        </p>
      </CardHeader>
      <CardContent>
        {senderEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun email non ouvert depuis plus de 6 mois trouvé
          </div>
        ) : (
          <div className="space-y-3">
            {senderEntries.map(([sender, data]) => (
              <div key={sender} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium truncate">{sender}</span>
                    <Badge variant="outline" className="text-xs">
                      {data.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {data.count} emails non lus
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteSender(data.emails)}
                  className="ml-4"
                >
                  Supprimer ({data.count})
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartDeletionSection;

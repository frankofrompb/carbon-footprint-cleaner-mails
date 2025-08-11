import { ScanResults, EmailData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

interface OldUnreadEmailsSectionProps {
  results: ScanResults;
  onDeleteSelected: (emailIds: string[]) => void;
}

const OldUnreadEmailsSection = ({ results, onDeleteSelected }: OldUnreadEmailsSectionProps) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Filtrer les emails non lus depuis plus de 6 mois
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const oldUnreadEmails = results.emails.filter(email => {
    const emailDate = new Date(email.date);
    const isOld = emailDate < sixMonthsAgo;
    const isUnread = email.isUnread || !email.isRead;
    return isOld && isUnread;
  });

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === oldUnreadEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(oldUnreadEmails.map(email => email.id));
    }
  };

  const handleDeleteSelected = () => {
    onDeleteSelected(selectedEmails);
    setSelectedEmails([]);
  };

  const calculateCarbonSaved = () => {
    return selectedEmails.length * 10; // 10g CO₂ par email
  };

  if (oldUnreadEmails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📧 Emails non lus +6 mois
            <Badge variant="outline">0 trouvé</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600">✅ Aucun email non lu depuis plus de 6 mois trouvé !</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📧 Emails non lus depuis plus de 6 mois
          <Badge variant="destructive">{oldUnreadEmails.length} trouvés</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Ces emails n'ont pas été ouverts depuis plus de 6 mois et peuvent probablement être supprimés.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                size="sm"
              >
                {selectedEmails.length === oldUnreadEmails.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={selectedEmails.length === 0}
                    size="sm"
                  >
                    Supprimer sélectionnés ({selectedEmails.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer {selectedEmails.length} emails ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera définitivement ces emails de votre Gmail.
                      Vous économiserez environ {calculateCarbonSaved()}g de CO₂.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedEmails.length === oldUnreadEmails.length && oldUnreadEmails.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Expéditeur</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Âge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oldUnreadEmails.slice(0, 20).map((email) => {
                const daysSince = Math.floor((Date.now() - new Date(email.date).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <TableRow key={email.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmails.includes(email.id)}
                        onCheckedChange={() => handleSelectEmail(email.id)}
                      />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{email.from}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{email.subject}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(email.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{daysSince} jours</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {oldUnreadEmails.length > 20 && (
            <p className="text-sm text-gray-500 text-center">
              Affichage des 20 premiers emails. {oldUnreadEmails.length - 20} autres emails non affichés.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OldUnreadEmailsSection;
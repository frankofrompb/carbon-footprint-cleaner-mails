import { ScanResults } from "@/types";
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
import { Trash2, Eye } from "lucide-react";

interface SenderAnalysisSectionProps {
  results: ScanResults;
  onDeleteSelected: (emailIds: string[]) => void;
}

interface SenderStats {
  email: string;
  count: number;
  totalSize: number;
  oldestDate: string;
  newestDate: string;
  emailIds: string[];
  categories: string[];
}

const SenderAnalysisSection = ({ results, onDeleteSelected }: SenderAnalysisSectionProps) => {
  const [expandedSender, setExpandedSender] = useState<string | null>(null);

  // Analyser les emails par expéditeur
  const senderStats: SenderStats[] = Object.entries(
    results.emails.reduce((acc, email) => {
      const sender = email.from;
      if (!acc[sender]) {
        acc[sender] = {
          email: sender,
          count: 0,
          totalSize: 0,
          oldestDate: email.date,
          newestDate: email.date,
          emailIds: [],
          categories: []
        };
      }
      
      acc[sender].count++;
      acc[sender].totalSize += email.size || 0;
      acc[sender].emailIds.push(email.id);
      
      if (new Date(email.date) < new Date(acc[sender].oldestDate)) {
        acc[sender].oldestDate = email.date;
      }
      if (new Date(email.date) > new Date(acc[sender].newestDate)) {
        acc[sender].newestDate = email.date;
      }
      
      if (email.classification?.category && !acc[sender].categories.includes(email.classification.category)) {
        acc[sender].categories.push(email.classification.category);
      }
      
      return acc;
    }, {} as Record<string, SenderStats>)
  )
  .map(([_, stats]) => stats)
  .sort((a, b) => b.count - a.count); // Tri par nombre d'emails décroissant

  const handleDeleteSender = (senderStats: SenderStats) => {
    onDeleteSelected(senderStats.emailIds);
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'promotional': return 'default';
      case 'social': return 'secondary';
      case 'old_unread': return 'destructive';
      case 'notification': return 'outline';
      default: return 'outline';
    }
  };

  const formatSizeMB = (sizeInBytes: number) => {
    return (sizeInBytes / (1024 * 1024)).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          👥 Analyse par expéditeurs
          <Badge variant="outline">{senderStats.length} expéditeurs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Emails triés par expéditeur en ordre décroissant du nombre d'emails reçus.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expéditeur</TableHead>
                <TableHead className="text-center">Nombre d'emails</TableHead>
                <TableHead className="text-center">Taille totale</TableHead>
                <TableHead className="text-center">Catégories</TableHead>
                <TableHead className="text-center">Période</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {senderStats.slice(0, 50).map((sender) => (
                <TableRow key={sender.email}>
                  <TableCell className="max-w-[250px]">
                    <div className="truncate" title={sender.email}>
                      {sender.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono">
                      {sender.count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-mono">
                      {formatSizeMB(sender.totalSize)} MB
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {sender.categories.slice(0, 3).map((category) => (
                        <Badge 
                          key={category}
                          variant={getCategoryBadgeVariant(category)}
                          className="text-xs"
                        >
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                      {sender.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{sender.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs text-gray-500">
                    <div>{new Date(sender.oldestDate).toLocaleDateString()}</div>
                    <div>→ {new Date(sender.newestDate).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedSender(
                          expandedSender === sender.email ? null : sender.email
                        )}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer tous les emails de {sender.email} ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action supprimera définitivement {sender.count} emails 
                              ({formatSizeMB(sender.totalSize)} MB) de cet expéditeur.
                              Vous économiserez environ {sender.count * 10}g de CO₂.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteSender(sender)}
                            >
                              Supprimer {sender.count} emails
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {senderStats.length > 50 && (
            <p className="text-sm text-gray-500 text-center">
              Affichage des 50 premiers expéditeurs. {senderStats.length - 50} autres expéditeurs non affichés.
            </p>
          )}

          {/* Détails de l'expéditeur sélectionné */}
          {expandedSender && (
            <Card className="mt-4 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  Détails pour {expandedSender}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const senderEmails = results.emails.filter(email => email.from === expandedSender);
                  return (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sujet</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Taille</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {senderEmails.slice(0, 10).map((email) => (
                          <TableRow key={email.id}>
                            <TableCell className="max-w-[300px] truncate">
                              {email.subject}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(email.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm">
                              {((email.size || 0) / 1024).toFixed(1)} KB
                            </TableCell>
                            <TableCell>
                              <Badge variant={email.isUnread ? "destructive" : "outline"}>
                                {email.isUnread ? "Non lu" : "Lu"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  );
                })()}
                {results.emails.filter(email => email.from === expandedSender).length > 10 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Affichage des 10 premiers emails. {results.emails.filter(email => email.from === expandedSender).length - 10} autres emails de cet expéditeur.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SenderAnalysisSection;
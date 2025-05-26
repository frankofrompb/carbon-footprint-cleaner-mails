
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScanState } from "@/types";
import { Search, Trash, Download, AlertTriangle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CarbonFootprintVisual from "./CarbonFootprintVisual";
import Dashboard from "./Dashboard";

interface EmailScannerProps {
  scanState: ScanState;
  onScan: () => void;
  onDelete: (selectedSenders: Set<string>) => void;
  onExport: () => void;
  userEmail: string;
}

const EmailScanner = ({ scanState, onScan, onDelete, onExport, userEmail }: EmailScannerProps) => {
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedSenders, setSelectedSenders] = useState<Set<string>>(new Set());

  // Grouper les emails par expéditeur
  const emailsByDender = useMemo(() => {
    if (!scanState.results?.emails) return [];

    const senderGroups = new Map<string, { count: number; totalSize: number; latestDate: string; years: Set<number> }>();

    scanState.results.emails.forEach(email => {
      const sender = email.from;
      const emailYear = new Date(email.date).getFullYear();
      const existing = senderGroups.get(sender);
      
      if (existing) {
        existing.count += 1;
        existing.totalSize += email.size || 0;
        existing.years.add(emailYear);
        // Garder la date la plus récente
        if (new Date(email.date) > new Date(existing.latestDate)) {
          existing.latestDate = email.date;
        }
      } else {
        senderGroups.set(sender, {
          count: 1,
          totalSize: email.size || 0,
          latestDate: email.date,
          years: new Set([emailYear])
        });
      }
    });

    // Convertir en tableau et trier par nombre d'emails (décroissant)
    return Array.from(senderGroups.entries())
      .map(([sender, data]) => ({
        sender,
        count: data.count,
        totalSize: data.totalSize,
        latestDate: data.latestDate,
        years: Array.from(data.years).sort((a, b) => b - a)
      }))
      .sort((a, b) => b.count - a.count);
  }, [scanState.results?.emails]);

  // Initialiser tous les expéditeurs comme sélectionnés par défaut
  useEffect(() => {
    if (emailsByDender.length > 0) {
      const allSenders = new Set(emailsByDender.map(item => item.sender));
      setSelectedSenders(allSenders);
    }
  }, [emailsByDender]);

  const handleSenderToggle = (sender: string, checked: boolean) => {
    const newSelected = new Set(selectedSenders);
    if (checked) {
      newSelected.add(sender);
    } else {
      newSelected.delete(sender);
    }
    setSelectedSenders(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedSenders(new Set());
  };

  const handleSelectAll = () => {
    const allSenders = new Set(emailsByDender.map(item => item.sender));
    setSelectedSenders(allSenders);
  };

  const selectedCount = useMemo(() => {
    return emailsByDender
      .filter(item => selectedSenders.has(item.sender))
      .reduce((total, item) => total + item.count, 0);
  }, [emailsByDender, selectedSenders]);

  const handleDelete = () => {
    onDelete(selectedSenders);
  };

  const toggleView = () => {
    setShowDashboard(!showDashboard);
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Analyseur d'emails</span>
            <span className="text-sm font-normal text-muted-foreground">{userEmail}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanState.isScanning ? (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center">
                <Search className="h-8 w-8 text-eco-blue animate-pulse" />
              </div>
              <p className="text-center">Recherche des emails de 2000 à 2024...</p>
              <Progress value={50} className="w-full" />
            </div>
          ) : scanState.error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{scanState.error}</AlertDescription>
            </Alert>
          ) : scanState.results ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Emails trouvés (2000-2024)</p>
                  <p className="text-3xl font-bold text-eco-blue">
                    {scanState.results.totalEmails}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Taille totale</p>
                  <p className="text-3xl font-bold text-eco-blue">
                    {scanState.results.totalSizeMB?.toFixed(2)} Mo
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Empreinte CO₂</p>
                  <p className="text-3xl font-bold text-eco-green">
                    {scanState.results.carbonFootprint}g
                  </p>
                </div>
              </div>

              {showDashboard ? (
                <>
                  <Button variant="outline" onClick={toggleView} className="w-full">
                    Voir les emails trouvés par expéditeur
                  </Button>
                  <Dashboard scanResults={scanState.results} />
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={toggleView} className="w-full">
                    Voir le tableau de bord
                  </Button>
                  <CarbonFootprintVisual carbonGrams={scanState.results.carbonFootprint} />

                  <Separator />

                  {emailsByDender.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Emails classés par expéditeur :</h3>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDeselectAll}
                          >
                            Tout désélectionner
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSelectAll}
                          >
                            Tout sélectionner
                          </Button>
                        </div>
                      </div>
                      
                      {selectedSenders.size > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {selectedCount} emails sélectionnés pour suppression
                        </p>
                      )}

                      <div className="max-h-96 overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Sélection</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Expéditeur</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Nb emails</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Années</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Taille (Ko)</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Dernier email</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {emailsByDender.slice(0, 20).map((senderData, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-2 text-center">
                                  <Checkbox
                                    checked={selectedSenders.has(senderData.sender)}
                                    onCheckedChange={(checked) => 
                                      handleSenderToggle(senderData.sender, checked as boolean)
                                    }
                                  />
                                </td>
                                <td className="px-4 py-2 text-sm max-w-xs truncate" title={senderData.sender}>
                                  {senderData.sender}
                                </td>
                                <td className="px-4 py-2 text-sm font-medium text-center">
                                  {senderData.count}
                                </td>
                                <td className="px-4 py-2 text-sm text-center">
                                  {senderData.years.join(', ')}
                                </td>
                                <td className="px-4 py-2 text-sm text-center">
                                  {senderData.totalSize.toFixed(1)}
                                </td>
                                <td className="px-4 py-2 text-sm text-center">
                                  {new Date(senderData.latestDate).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                            {emailsByDender.length > 20 && (
                              <tr>
                                <td colSpan={6} className="px-4 py-2 text-center text-sm text-muted-foreground">
                                  Et {emailsByDender.length - 20} autres expéditeurs...
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Top {Math.min(20, emailsByDender.length)} expéditeurs sur {emailsByDender.length} au total
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Cliquez sur "Scanner ma boîte mail" pour commencer l'analyse
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
          <Button
            onClick={onScan}
            disabled={scanState.isScanning}
            className="w-full sm:w-auto"
            variant={scanState.results ? "outline" : "default"}
          >
            <Search className="mr-2 h-4 w-4" />
            {scanState.results ? "Relancer le scan" : "Scanner ma boîte mail"}
          </Button>

          {scanState.results && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
                    disabled={selectedSenders.size === 0}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Supprimer {selectedCount} emails
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous êtes sur le point de supprimer {selectedCount} emails des expéditeurs sélectionnés. 
                      Cette action est irréversible. Voulez-vous continuer ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button 
                onClick={onExport} 
                className="w-full sm:w-auto" 
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter en CSV
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailScanner;

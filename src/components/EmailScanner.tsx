
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScanState } from "@/types";
import { Search, Trash, Download, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
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
  onDelete: () => void;
  onExport: () => void;
  userEmail: string;
}

const EmailScanner = ({ scanState, onScan, onDelete, onExport, userEmail }: EmailScannerProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);

  // Grouper les emails par expéditeur
  const emailsByDender = useMemo(() => {
    if (!scanState.results?.emails) return [];

    const senderGroups = new Map<string, { count: number; totalSize: number; latestDate: string }>();

    scanState.results.emails.forEach(email => {
      const sender = email.from;
      const existing = senderGroups.get(sender);
      
      if (existing) {
        existing.count += 1;
        existing.totalSize += email.size || 0;
        // Garder la date la plus récente
        if (new Date(email.date) > new Date(existing.latestDate)) {
          existing.latestDate = email.date;
        }
      } else {
        senderGroups.set(sender, {
          count: 1,
          totalSize: email.size || 0,
          latestDate: email.date
        });
      }
    });

    // Convertir en tableau et trier par nombre d'emails (décroissant)
    return Array.from(senderGroups.entries())
      .map(([sender, data]) => ({
        sender,
        count: data.count,
        totalSize: data.totalSize,
        latestDate: data.latestDate
      }))
      .sort((a, b) => b.count - a.count);
  }, [scanState.results?.emails]);

  const handleDelete = () => {
    setShowConfirmation(false);
    onDelete();
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
              <p className="text-center">Recherche des emails non lus de plus d'un an...</p>
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
                  <p className="text-sm text-muted-foreground">Emails non lus</p>
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
                      <h3 className="font-medium">Emails classés par expéditeur :</h3>
                      <div className="max-h-96 overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Expéditeur</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Nb emails</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Taille (Ko)</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Dernier email</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {emailsByDender.slice(0, 20).map((senderData, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-2 text-sm max-w-xs truncate" title={senderData.sender}>
                                  {senderData.sender}
                                </td>
                                <td className="px-4 py-2 text-sm font-medium text-center">
                                  {senderData.count}
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
                                <td colSpan={4} className="px-4 py-2 text-center text-sm text-muted-foreground">
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
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Supprimer {scanState.results.totalEmails} emails
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous êtes sur le point de supprimer {scanState.results.totalEmails} emails non lus. 
                      Cette action est irréversible. Voulez-vous continuer ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
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

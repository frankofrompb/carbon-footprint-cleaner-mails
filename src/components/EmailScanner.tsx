
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScanState } from "@/types";
import { Search, Trash, Download, AlertTriangle } from "lucide-react";
import { useState } from "react";
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
                    Voir les emails trouvés
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

                  {scanState.results.emails.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Échantillon des emails trouvés :</h3>
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Sujet</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Expéditeur</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {scanState.results.emails.slice(0, 5).map((email) => (
                              <tr key={email.id}>
                                <td className="px-4 py-2 text-sm">{email.subject}</td>
                                <td className="px-4 py-2 text-sm">{email.from}</td>
                                <td className="px-4 py-2 text-sm">
                                  {new Date(email.date).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                            {scanState.results.emails.length > 5 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-center text-sm text-muted-foreground">
                                  Et {scanState.results.emails.length - 5} autres emails...
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
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

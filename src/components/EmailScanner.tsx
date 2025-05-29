
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScanState } from "@/types";
import { Search, Trash, Download, AlertTriangle, Trash2, FolderOpen, Brain } from "lucide-react";
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
import ScanningAnimation from "./ScanningAnimation";
import MusicPrompt from "./MusicPrompt";
import SenderAnalysisView from "./SenderAnalysisView";
import { formatNumber } from "@/lib/utils";

type ScanType = 'smart-deletion' | 'sender-analysis' | 'smart-sorting';

interface EmailScannerProps {
  scanState: ScanState;
  onScan: () => void;
  onDelete: (selectedSenders: Set<string>) => void;
  onExport: () => void;
  userEmail: string;
  scanType: ScanType;
}

const EmailScanner = ({ scanState, onScan, onDelete, onExport, userEmail, scanType }: EmailScannerProps) => {
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedSenders, setSelectedSenders] = useState<Set<string>>(new Set());
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);

  // Configuration selon le type de scan
  const scanConfig = useMemo(() => {
    switch (scanType) {
      case 'smart-deletion':
        return {
          title: 'Suppression Intelligente',
          icon: <Trash2 className="h-5 w-5" />,
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-500 hover:bg-red-600',
          description: 'Analyse des emails non lus depuis plus d\'un an pour suppression automatique',
          scanButtonText: 'Scanner pour suppression',
          actionButtonText: 'Supprimer'
        };
      case 'sender-analysis':
        return {
          title: 'Analyse des Expéditeurs',
          icon: <FolderOpen className="h-5 w-5" />,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonColor: 'bg-blue-500 hover:bg-blue-600',
          description: 'Classification des expéditeurs par fréquence et pertinence',
          scanButtonText: 'Analyser les expéditeurs',
          actionButtonText: 'Traiter'
        };
      case 'smart-sorting':
        return {
          title: 'Tri Intelligent',
          icon: <Brain className="h-5 w-5" />,
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonColor: 'bg-[#38c39d] hover:bg-[#2ea082]',
          description: 'Organisation automatique des emails par dossiers intelligents',
          scanButtonText: 'Organiser mes emails',
          actionButtonText: 'Organiser'
        };
    }
  }, [scanType]);

  // Afficher le prompt musique quand le scan commence
  useEffect(() => {
    if (scanState.isScanning && !showMusicPrompt) {
      // Délai de 2 secondes pour laisser l'animation de scan s'installer
      const timer = setTimeout(() => {
        setShowMusicPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (!scanState.isScanning) {
      setShowMusicPrompt(false);
    }
  }, [scanState.isScanning]);

  const handleActivateMusic = () => {
    // Déclencher l'activation de la musique (via l'event custom ou callback parent)
    const event = new CustomEvent('activateMusic');
    window.dispatchEvent(event);
    setShowMusicPrompt(false);
  };

  const handleDismissMusicPrompt = () => {
    setShowMusicPrompt(false);
  };

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

  const handleScanEmails = () => {
    onScan();
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card className={`shadow-md ${scanConfig.borderColor} border-2`}>
        <CardHeader className={scanConfig.bgColor}>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {scanConfig.icon}
              <span className={scanConfig.color}>{scanConfig.title}</span>
            </div>
            <span className="text-sm font-normal text-muted-foreground">{userEmail}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{scanConfig.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanState.isScanning ? (
            <div className="space-y-6">
              <ScanningAnimation />
              
              {/* Prompt pour activer la musique */}
              {showMusicPrompt && (
                <div className="animate-fade-in">
                  <MusicPrompt 
                    onActivateMusic={handleActivateMusic}
                    onDismiss={handleDismissMusicPrompt}
                  />
                </div>
              )}
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
                  <p className="text-sm text-muted-foreground">Emails trouvés</p>
                  <p className="text-3xl font-bold text-eco-blue">
                    {formatNumber(scanState.results.totalEmails)}
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
                    {formatNumber(scanState.results.carbonFootprint)}g
                  </p>
                </div>
              </div>

              {/* Vue spéciale pour l'analyse des expéditeurs */}
              {scanType === 'sender-analysis' ? (
                <SenderAnalysisView scanState={scanState} />
              ) : showDashboard ? (
                <>
                  <Button variant="outline" onClick={toggleView} className="w-full">
                    Voir tous les emails trouvés par expéditeur
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
                          {formatNumber(selectedCount)} emails sélectionnés pour traitement
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground">
                        {emailsByDender.length} expéditeurs différents • {formatNumber(scanState.results.emails.length)} emails récupérés sur {formatNumber(scanState.results.totalEmails)} trouvés
                      </p>

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
                            {emailsByDender.map((senderData, index) => (
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
                                  {formatNumber(senderData.count)}
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
              <div className={`mx-auto h-12 w-12 mb-4 ${scanConfig.color}`}>
                {scanConfig.icon}
              </div>
              <p className="text-muted-foreground">
                Cliquez sur "{scanConfig.scanButtonText}" pour commencer l'analyse
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
          <Button
            onClick={handleScanEmails}
            disabled={scanState.isScanning}
            className={`w-full sm:w-auto ${scanConfig.buttonColor} text-white`}
            variant={scanState.results ? "outline" : "default"}
          >
            {scanConfig.icon}
            <span className="ml-2">
              {scanState.results ? `Relancer ${scanConfig.scanButtonText.toLowerCase()}` : scanConfig.scanButtonText}
            </span>
          </Button>

          {scanState.results && scanType !== 'sender-analysis' && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className={`w-full sm:w-auto ${scanConfig.buttonColor} text-white`}
                    disabled={selectedSenders.size === 0}
                  >
                    {scanConfig.icon}
                    <span className="ml-2">
                      {scanConfig.actionButtonText} {formatNumber(selectedCount)} emails
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmation de {scanConfig.actionButtonText.toLowerCase()}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous êtes sur le point de {scanConfig.actionButtonText.toLowerCase()} {formatNumber(selectedCount)} emails des expéditeurs sélectionnés. 
                      {scanType === 'smart-deletion' && ' Cette action est irréversible.'} Voulez-vous continuer ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      {scanConfig.actionButtonText}
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

          {scanState.results && scanType === 'sender-analysis' && (
            <Button 
              onClick={onExport} 
              className="w-full sm:w-auto" 
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter en CSV
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailScanner;

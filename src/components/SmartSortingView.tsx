
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScanState } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Brain, FolderPlus, Check, Edit3, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SmartSortingViewProps {
  scanState: ScanState;
}

interface CategorizedEmails {
  [folderName: string]: Array<{
    id: string;
    subject: string;
    from: string;
    classification: {
      category: string;
      confidence: number;
      suggestedFolder: string;
    };
  }>;
}

const SmartSortingView = ({ scanState }: SmartSortingViewProps) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState("3months");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [categorizedEmails, setCategorizedEmails] = useState<CategorizedEmails | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editedFolderName, setEditedFolderName] = useState("");
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [processingProgress, setProcessingProgress] = useState(0);

  const periodOptions = [
    { value: "1month", label: "1 mois" },
    { value: "3months", label: "3 mois" },
    { value: "6months", label: "6 mois" },
    { value: "1year", label: "1 an" },
    { value: "all", label: "Tous les emails" }
  ];

  const handleStartSorting = useCallback(async () => {
    if (!scanState.results?.emails) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const storedAuth = localStorage.getItem("emailCleanerAuth");
      if (!storedAuth) {
        throw new Error("Token d'accès manquant");
      }

      const parsedAuth = JSON.parse(storedAuth);

      toast({
        title: "🧠 Tri intelligent en cours",
        description: "Classification des emails par IA...",
      });

      // Simulation du progrès
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('smart-email-sorting', {
        body: {
          accessToken: parsedAuth.accessToken,
          emails: scanState.results.emails,
          period: period
        }
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (error) {
        throw new Error(`Erreur lors de la classification: ${error.message}`);
      }

      setCategorizedEmails(data.categorizedEmails);
      setSelectedFolders(new Set(Object.keys(data.categorizedEmails)));

      toast({
        title: "✅ Classification terminée",
        description: `${data.totalProcessed} emails classifiés en ${Object.keys(data.categorizedEmails).length} catégories`,
      });
    } catch (error) {
      console.error("Erreur lors du tri intelligent:", error);
      toast({
        title: "❌ Erreur de classification",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [scanState.results, period, toast]);

  const handleEditFolder = (folderName: string) => {
    setEditingFolder(folderName);
    setEditedFolderName(folderName);
  };

  const handleSaveFolder = () => {
    if (!categorizedEmails || !editingFolder || !editedFolderName.trim()) return;

    const newCategorized = { ...categorizedEmails };
    const emails = newCategorized[editingFolder];
    delete newCategorized[editingFolder];
    newCategorized[editedFolderName.trim()] = emails;

    setCategorizedEmails(newCategorized);
    
    // Mettre à jour la sélection
    const newSelected = new Set(selectedFolders);
    if (newSelected.has(editingFolder)) {
      newSelected.delete(editingFolder);
      newSelected.add(editedFolderName.trim());
      setSelectedFolders(newSelected);
    }

    setEditingFolder(null);
    setEditedFolderName("");
  };

  const handleFolderToggle = (folderName: string, checked: boolean) => {
    const newSelected = new Set(selectedFolders);
    if (checked) {
      newSelected.add(folderName);
    } else {
      newSelected.delete(folderName);
    }
    setSelectedFolders(newSelected);
  };

  const handleApplySorting = async () => {
    if (!categorizedEmails) return;

    setIsApplying(true);

    try {
      const storedAuth = localStorage.getItem("emailCleanerAuth");
      if (!storedAuth) {
        throw new Error("Token d'accès manquant");
      }

      const parsedAuth = JSON.parse(storedAuth);

      // Préparer les actions pour les dossiers sélectionnés
      const folderActions: Record<string, string[]> = {};
      selectedFolders.forEach(folderName => {
        const emails = categorizedEmails[folderName];
        if (emails && emails.length > 0) {
          folderActions[folderName] = emails.map(email => email.id);
        }
      });

      const selectedEmailCount = Object.values(folderActions)
        .reduce((sum, ids) => sum + ids.length, 0);

      toast({
        title: "📁 Application du tri en cours",
        description: `Organisation de ${selectedEmailCount} emails dans ${selectedFolders.size} dossiers...`,
      });

      const { data, error } = await supabase.functions.invoke('apply-smart-sorting', {
        body: {
          accessToken: parsedAuth.accessToken,
          folderActions: folderActions
        }
      });

      if (error) {
        throw new Error(`Erreur lors de l'application: ${error.message}`);
      }

      toast({
        title: "🎉 Tri intelligent terminé",
        description: `${data.totalProcessed} emails organisés avec succès dans leurs dossiers !`,
      });

      // Réinitialiser l'état
      setCategorizedEmails(null);
      setSelectedFolders(new Set());
    } catch (error) {
      console.error("Erreur lors de l'application du tri:", error);
      toast({
        title: "❌ Erreur d'application",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (!scanState.results || !scanState.results.emails.length) {
    return (
      <div className="text-center py-8">
        <Brain className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-bold text-green-600">Aucun email à trier</h3>
        <p className="text-muted-foreground mt-2">
          Veuillez d'abord effectuer un scan de vos emails
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Tri Intelligent</h3>
        <p className="text-muted-foreground mb-4">
          Classification automatique de vos emails par catégories
        </p>
      </div>

      {!categorizedEmails ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Configuration du tri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="period">Période d'analyse</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {formatNumber(scanState.results.emails.length)} emails seront analysés
              </p>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Classification en cours...</span>
                  <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={handleStartSorting} 
              disabled={isProcessing}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Classification en cours...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Commencer le tri intelligent
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5" />
                  Dossiers proposés
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedFolders.size} sur {Object.keys(categorizedEmails).length} sélectionnés
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vérifiez et modifiez les noms de dossiers si nécessaire, puis confirmez la sélection :
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(categorizedEmails).map(([folderName, emails]) => (
                  <div key={folderName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedFolders.has(folderName)}
                        onCheckedChange={(checked) => 
                          handleFolderToggle(folderName, checked as boolean)
                        }
                      />
                      {editingFolder === folderName ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editedFolderName}
                            onChange={(e) => setEditedFolderName(e.target.value)}
                            className="w-48"
                          />
                          <Button size="sm" onClick={handleSaveFolder}>
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{folderName}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditFolder(folderName)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {emails.length} email{emails.length > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleApplySorting}
                  disabled={selectedFolders.size === 0 || isApplying}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Application en cours...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Appliquer le tri ({Array.from(selectedFolders).reduce((sum, folder) => 
                        sum + (categorizedEmails[folder]?.length || 0), 0)} emails)
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategorizedEmails(null);
                    setSelectedFolders(new Set());
                  }}
                >
                  Recommencer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartSortingView;

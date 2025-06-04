import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ScanResults, EmailData } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface ScanState {
  status: 'idle' | 'scanning' | 'completed' | 'error';
  results: ScanResults | null;
  error: string | null;
  progress: number;
  intelligentResults?: any;
  allEmailsResults?: ScanResults | null;
}

export const useScanEmails = () => {
  const { toast } = useToast();
  const [scanState, setScanState] = useState<ScanState>({
    status: 'idle',
    results: null,
    error: null,
    progress: 0,
  });

  const scanEmails = useCallback(async (scanType?: 'smart-deletion' | 'sender-analysis' | 'smart-sorting' | 'intelligent-scan') => {
    setScanState({
      status: 'scanning',
      results: null,
      error: null,
      progress: 0,
    });

    try {
      const storedAuth = localStorage.getItem("emailCleanerAuth");
      if (!storedAuth) {
        throw new Error("Aucun token d'accès trouvé. Veuillez vous reconnecter.");
      }

      const parsedAuth = JSON.parse(storedAuth);
      if (!parsedAuth.accessToken) {
        throw new Error("Token d'accès invalide. Veuillez vous reconnecter.");
      }

      // Utiliser scan-all-gmail pour tous les types de scan pour éviter les erreurs
      const functionName = 'scan-all-gmail';
      
      const description = scanType === 'sender-analysis' 
        ? "Analyse de tous vos emails en cours..." 
        : scanType === 'smart-sorting'
        ? "Récupération des emails pour tri intelligent..."
        : "Analyse de votre boîte Gmail en cours...";

      toast({
        title: "Scan démarré",
        description: description,
      });

      console.log(`Calling ${functionName} function...`);
      setScanState(prev => ({ ...prev, progress: 25 }));

      // Ajouter un timeout plus long pour les gros scans
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          accessToken: parsedAuth.accessToken
        }
      });

      setScanState(prev => ({ ...prev, progress: 75 }));

      console.log("Function response:", { data, error });

      if (error) {
        console.error("Function error:", error);
        
        // Gestion spécifique des erreurs de quota
        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
          throw new Error("Limite de quota Gmail atteinte. Veuillez réessayer dans quelques minutes.");
        }
        
        throw new Error(`Erreur lors du scan: ${error.message}`);
      }

      if (!data) {
        throw new Error("Aucune donnée reçue du scan");
      }

      if (data.error) {
        console.error("Gmail API error:", data.error);
        
        // Gestion spécifique des erreurs de quota Gmail
        if (data.error.includes('Quota exceeded') || data.error.includes('rateLimitExceeded')) {
          throw new Error("Limite de quota Gmail atteinte. Veuillez réessayer dans quelques minutes.");
        }
        
        throw new Error(`Erreur Gmail: ${data.error}`);
      }

      console.log("Scan results:", data);

      const newState: ScanState = {
        status: 'completed',
        results: data,
        error: null,
        progress: 100,
      };

      if (scanType === 'sender-analysis' || scanType === 'smart-sorting') {
        newState.allEmailsResults = data;
      }

      setScanState(newState);

      const emailText = (scanType === 'sender-analysis' || scanType === 'smart-sorting') ? "emails" : "emails";
      toast({
        title: "Scan terminé",
        description: `${data.totalEmails} ${emailText} trouvés dans votre boîte Gmail, ${data.carbonFootprint}g de CO₂`,
      });
    } catch (error) {
      console.error("Erreur lors du scan des emails", error);
      
      let errorMessage = "Erreur lors du scan des emails";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setScanState({
        status: 'error',
        results: null,
        error: errorMessage,
        progress: 0,
      });

      toast({
        title: "Échec du scan",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteEmails = useCallback(async (emailIds: string[]) => {
    if (!scanState.results) return;

    try {
      const storedAuth = localStorage.getItem("emailCleanerAuth");
      if (!storedAuth) {
        throw new Error("Aucun token d'accès trouvé. Veuillez vous reconnecter.");
      }

      const parsedAuth = JSON.parse(storedAuth);
      if (!parsedAuth.accessToken) {
        throw new Error("Token d'accès invalide. Veuillez vous reconnecter.");
      }

      const emailCount = emailIds.length;

      if (emailCount === 0) {
        toast({
          title: "Aucun email à supprimer",
          description: "Veuillez sélectionner au moins un email.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Suppression en cours",
        description: `Suppression de ${emailCount} emails de votre boîte Gmail...`,
      });

      console.log("Calling Gmail delete function...");

      const { data, error } = await supabase.functions.invoke('delete-gmail-emails', {
        body: {
          accessToken: parsedAuth.accessToken,
          emailIds: emailIds
        }
      });

      if (error) {
        console.error("Delete function error:", error);
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
      }

      if (data.error) {
        console.error("Gmail delete error:", data.error);
        throw new Error(`Erreur Gmail: ${data.error}`);
      }

      console.log("Delete results:", data);

      const carbonSaved = emailCount * 10;

      toast({
        title: "Suppression terminée",
        description: `${data.deletedCount || emailCount} emails supprimés avec succès de votre boîte Gmail ! Vous avez économisé ${carbonSaved}g de CO₂!`,
      });

      setScanState({
        status: 'idle',
        results: null,
        error: null,
        progress: 0,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression des emails", error);
      toast({
        title: "Échec de la suppression",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression des emails",
        variant: "destructive",
      });
    }
  }, [scanState.results, toast]);

  const exportToCsv = useCallback(() => {
    if (!scanState.results?.emails.length) return;

    try {
      const headers = ["Sujet", "Expéditeur", "Date", "Taille (Ko)"];
      const rows = scanState.results.emails.map(email => [
        `"${email.subject.replace(/"/g, '""')}"`,
        `"${email.from.replace(/"/g, '""')}"`,
        new Date(email.date).toLocaleDateString(),
        email.size?.toString() || "0"
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `emails_gmail_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: "Le fichier CSV de vos emails Gmail a été téléchargé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de l'export des emails", error);
      toast({
        title: "Échec de l'export",
        description: "Une erreur est survenue lors de la génération du fichier CSV",
        variant: "destructive",
      });
    }
  }, [scanState.results, toast]);

  return {
    scanState,
    scanEmails,
    deleteEmails,
    exportToCsv,
  };
};

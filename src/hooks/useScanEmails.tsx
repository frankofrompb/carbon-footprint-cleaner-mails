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
      // Récupérer le token d'accès depuis le localStorage
      const storedAuth = localStorage.getItem("emailCleanerAuth");
      if (!storedAuth) {
        throw new Error("Aucun token d'accès trouvé. Veuillez vous reconnecter.");
      }

      const parsedAuth = JSON.parse(storedAuth);
      if (!parsedAuth.accessToken) {
        throw new Error("Token d'accès invalide. Veuillez vous reconnecter.");
      }

      // Choisir la fonction appropriée selon le type de scan
      const functionName = scanType === 'intelligent-scan' 
        ? 'intelligent-email-scan'
        : (scanType === 'sender-analysis' || scanType === 'smart-sorting') 
        ? 'scan-all-gmail' 
        : 'scan-gmail';
      
      const description = scanType === 'intelligent-scan'
        ? "Scan intelligent en cours : détection des emails non lus +6 mois, classification automatique..."
        : scanType === 'sender-analysis' 
        ? "Analyse de tous vos emails en cours..." 
        : scanType === 'smart-sorting'
        ? "Récupération des emails pour tri intelligent..."
        : "Analyse de votre vraie boîte Gmail en cours...";

      toast({
        title: "Scan démarré",
        description: description,
      });

      console.log(`Calling ${functionName} function...`);

      // Simuler progression
      setScanState(prev => ({ ...prev, progress: 25 }));

      // Appeler la fonction Edge appropriée
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          accessToken: parsedAuth.accessToken
        }
      });

      setScanState(prev => ({ ...prev, progress: 75 }));

      if (error) {
        console.error("Function error:", error);
        throw new Error(`Erreur lors du scan: ${error.message}`);
      }

      if (data.error) {
        console.error("Gmail API error:", data.error);
        throw new Error(`Erreur Gmail: ${data.error}`);
      }

      console.log("Scan results:", data);

      setScanState({
        status: 'completed',
        results: data,
        error: null,
        progress: 100,
      });

      if (scanType === 'intelligent-scan') {
        toast({
          title: "Scan intelligent terminé",
          description: `${data.summary?.oldUnreadEmails || 0} emails non lus +6 mois, ${data.summary?.promotionalEmails || 0} promotionnels, ${data.summary?.autoClassifiableEmails || 0} auto-classifiables détectés`,
        });
      } else {
        const emailText = (scanType === 'sender-analysis' || scanType === 'smart-sorting') ? "emails" : "emails non lus";
        toast({
          title: "Scan terminé",
          description: `${data.totalEmails} ${emailText} trouvés dans votre boîte Gmail, ${data.carbonFootprint}g de CO₂`,
        });
      }
    } catch (error) {
      console.error("Erreur lors du scan des emails", error);
      setScanState({
        status: 'error',
        results: null,
        error: error instanceof Error ? error.message : "Erreur lors du scan des emails",
        progress: 0,
      });

      toast({
        title: "Échec du scan",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la recherche des emails",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteEmails = useCallback(async (emailIds: string[]) => {
    if (!scanState.results) return;

    try {
      // Récupérer le token d'accès
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

      // Appeler la fonction Edge pour supprimer les emails
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

      // Calculer l'empreinte carbone économisée
      const carbonSaved = emailCount * 10; // 10g par email

      toast({
        title: "Suppression terminée",
        description: `${data.deletedCount || emailCount} emails supprimés avec succès de votre boîte Gmail ! Vous avez économisé ${carbonSaved}g de CO₂!`,
      });

      // Réinitialiser les résultats
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
      // Créer le contenu CSV
      const headers = ["Sujet", "Expéditeur", "Date", "Taille (Ko)"];
      const rows = scanState.results.emails.map(email => [
        `"${email.subject.replace(/"/g, '""')}"`, // Échapper les guillemets
        `"${email.from.replace(/"/g, '""')}"`,
        new Date(email.date).toLocaleDateString(),
        email.size?.toString() || "0"
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // Créer un blob et un lien de téléchargement
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `emails_non_lus_gmail_${new Date().toISOString().split("T")[0]}.csv`);
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


import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ScanResults, ScanState, EmailData } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useScanEmails = () => {
  const { toast } = useToast();
  const [scanState, setScanState] = useState<ScanState>({
    isScanning: false,
    results: null,
    error: null,
  });

  const scanEmails = useCallback(async () => {
    setScanState({
      isScanning: true,
      results: null,
      error: null,
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

      toast({
        title: "Scan démarré",
        description: "Analyse de votre vraie boîte Gmail en cours...",
      });

      console.log("Calling Gmail scan function...");

      // Appeler la fonction Edge pour scanner Gmail
      const { data, error } = await supabase.functions.invoke('scan-gmail', {
        body: {
          accessToken: parsedAuth.accessToken
        }
      });

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
        isScanning: false,
        results: data,
        error: null,
      });

      toast({
        title: "Scan terminé",
        description: `${data.totalEmails} emails non lus trouvés dans votre boîte Gmail, ${data.carbonFootprint}g de CO₂`,
      });
    } catch (error) {
      console.error("Erreur lors du scan des emails", error);
      setScanState({
        isScanning: false,
        results: null,
        error: error instanceof Error ? error.message : "Erreur lors du scan des emails",
      });

      toast({
        title: "Échec du scan",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la recherche des emails",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteEmails = useCallback(async () => {
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

      toast({
        title: "Suppression en cours",
        description: `Suppression de ${scanState.results.totalEmails} emails de votre boîte Gmail...`,
      });

      console.log("Calling Gmail delete function...");

      // Récupérer tous les IDs des emails (pas seulement ceux affichés)
      const allEmailIds = scanState.results.emails.map(email => email.id);

      // Appeler la fonction Edge pour supprimer les emails
      const { data, error } = await supabase.functions.invoke('delete-gmail-emails', {
        body: {
          accessToken: parsedAuth.accessToken,
          emailIds: allEmailIds
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

      toast({
        title: "Suppression terminée",
        description: `${data.deletedCount || scanState.results.totalEmails} emails supprimés avec succès de votre boîte Gmail ! Vous avez économisé ${scanState.results.carbonFootprint}g de CO₂!`,
      });

      // Réinitialiser les résultats
      setScanState({
        isScanning: false,
        results: null,
        error: null,
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

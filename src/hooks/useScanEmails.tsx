import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ScanResults } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useScanResultsHandler } from "./useScanResultsHandler";

interface ScanState {
  status: 'idle' | 'scanning' | 'completed' | 'error';
  results: ScanResults | null;
  error: string | null;
  progress: number;
}

export const useScanEmails = () => {
  const { toast } = useToast();
  const { processRawScanData, validateScanResults } = useScanResultsHandler();
  const [scanState, setScanState] = useState<ScanState>({
    status: 'idle',
    results: null,
    error: null,
    progress: 0,
  });

  const scanEmails = useCallback(async (scanType?: 'smart-deletion' | 'sender-analysis' | 'smart-sorting' | 'intelligent-scan') => {
    console.log('🚀 DEBUG useScanEmails - DÉBUT DU SCAN:', scanType);
    
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

      console.log('🔑 DEBUG - Token récupéré, longueur:', parsedAuth.accessToken.length);

      // Choisir la fonction appropriée selon le type de scan
      const functionName = scanType === 'intelligent-scan' 
        ? 'intelligent-email-scan'
        : (scanType === 'sender-analysis' || scanType === 'smart-sorting') 
        ? 'scan-all-gmail' 
        : 'scan-gmail';
      
      console.log(`📡 DEBUG - Appel de la fonction: ${functionName}`);

      toast({
        title: "Scan démarré",
        description: "Scan intelligent en cours : détection des emails réels...",
      });

      setScanState(prev => ({ ...prev, progress: 25 }));

      // Appeler la fonction Edge appropriée
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          accessToken: parsedAuth.accessToken
        }
      });

      setScanState(prev => ({ ...prev, progress: 75 }));

      console.log('📊 DEBUG - RÉPONSE BRUTE DE LA FONCTION EDGE:');
      console.log('Data reçue:', data);
      console.log('Type de data:', typeof data);
      console.log('Data est null/undefined:', data === null || data === undefined);
      console.log('Clés de data:', data ? Object.keys(data) : 'AUCUNE CLÉ');
      console.log('Error:', error);
      
      if (data) {
        console.log('📧 DEBUG - DÉTAILS DES EMAILS DANS LA RÉPONSE:');
        console.log('totalEmails dans data:', data.totalEmails);
        console.log('emails array dans data:', data.emails);
        console.log('Type du tableau emails:', Array.isArray(data.emails) ? 'Array' : typeof data.emails);
        console.log('Longueur du tableau emails:', data.emails?.length);
        
        if (data.emails && Array.isArray(data.emails) && data.emails.length > 0) {
          console.log('Premier email de la réponse:', data.emails[0]);
          console.log('Sujet du premier email:', data.emails[0]?.subject);
          console.log('Expéditeur du premier email:', data.emails[0]?.from);
        }
      }

      if (error) {
        console.error("❌ DEBUG - Erreur de la fonction:", error);
        throw new Error(`Erreur lors du scan: ${error.message}`);
      }

      if (data?.error) {
        console.error("❌ DEBUG - Erreur Gmail API:", data.error);
        throw new Error(`Erreur Gmail: ${data.error}`);
      }

      console.log('🔄 DEBUG - AVANT TRAITEMENT DES DONNÉES');
      
      // Traiter les résultats avec le handler dédié
      const processedResults = processRawScanData(data);
      
      console.log('🔄 DEBUG - APRÈS TRAITEMENT DES DONNÉES:');
      console.log('Résultats traités:', processedResults);
      console.log('Emails dans les résultats traités:', processedResults.emails);
      console.log('Nombre d\'emails traités:', processedResults.emails?.length);
      
      // Valider les résultats
      if (!validateScanResults(processedResults)) {
        throw new Error("Les données reçues sont invalides");
      }

      console.log("✅ DEBUG - RÉSULTATS FINAUX VALIDÉS:", {
        totalEmails: processedResults.totalEmails,
        emailsCount: processedResults.emails.length,
        carbonFootprint: processedResults.carbonFootprint,
        hasSummary: !!processedResults.summary,
        premierEmailFinal: processedResults.emails[0]
      });

      // SAUVEGARDER LES RÉSULTATS DANS LE LOCALSTORAGE
      console.log('💾 DEBUG - Sauvegarde des résultats dans localStorage');
      localStorage.setItem("lastScanResults", JSON.stringify(processedResults));

      // MISE À JOUR CRITIQUE DE L'ÉTAT
      console.log('🔥 DEBUG - MISE À JOUR DE L\'ÉTAT VERS COMPLETED');
      const finalState = {
        status: 'completed' as const,
        results: processedResults,
        error: null,
        progress: 100,
      };
      console.log('🔥 DEBUG - NOUVEL ÉTAT:', finalState);
      setScanState(finalState);

      toast({
        title: "Scan intelligent terminé",
        description: `${processedResults.totalEmails} emails trouvés : ${processedResults.summary?.oldUnreadEmails || 0} non lus +6 mois, ${processedResults.summary?.promotionalEmails || 0} promotionnels`,
      });
    } catch (error) {
      console.error("❌ DEBUG - ERREUR FINALE:", error);
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
  }, [toast, processRawScanData, validateScanResults]);

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
      const headers = ["Sujet", "Expéditeur", "Date", "Taille (Ko)", "Classification", "Action suggérée"];
      const rows = scanState.results.emails.map(email => [
        `"${email.subject.replace(/"/g, '""')}"`,
        `"${email.from.replace(/"/g, '""')}"`,
        new Date(email.date).toLocaleDateString(),
        email.size?.toString() || "0",
        email.classification?.category || "other",
        email.classification?.suggestedAction || "review"
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `scan_intelligent_gmail_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: "Le fichier CSV de votre scan intelligent a été téléchargé avec succès",
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

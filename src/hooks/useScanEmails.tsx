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
      console.log('🔑 DEBUG - Token type:', typeof parsedAuth.accessToken);

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

      // Préparer le body de la requête
      const requestBody = {
        accessToken: parsedAuth.accessToken
      };

      console.log('📤 DEBUG - Body de la requête préparé:', {
        hasAccessToken: !!requestBody.accessToken,
        tokenLength: requestBody.accessToken?.length,
        tokenType: typeof requestBody.accessToken
      });

      // Appeler la fonction Edge avec un timeout et meilleure gestion d'erreur
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 180000); // 3 minutes timeout

      let result;
      try {
        console.log('📡 DEBUG - Invocation de la fonction avec le body:', JSON.stringify(requestBody).substring(0, 100));
        
        result = await supabase.functions.invoke(functionName, {
          body: requestBody,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        console.log('📡 DEBUG - Résultat de l\'invocation:', {
          hasData: !!result.data,
          hasError: !!result.error,
          dataType: typeof result.data,
          errorType: typeof result.error
        });
        
      } catch (invokeError) {
        clearTimeout(timeoutId);
        console.error('❌ DEBUG - Erreur lors de l\'invocation:', {
          error: invokeError,
          message: invokeError instanceof Error ? invokeError.message : 'Erreur inconnue',
          name: invokeError instanceof Error ? invokeError.name : 'N/A',
          stack: invokeError instanceof Error ? invokeError.stack : 'N/A'
        });
        
        // Diagnostiquer le type d'erreur
        if (invokeError instanceof Error && invokeError.name === 'AbortError') {
          throw new Error('Le scan a pris trop de temps (timeout). Veuillez réessayer avec moins d\'emails.');
        } else if (invokeError instanceof Error && invokeError.message.includes('FunctionsHttpError')) {
          throw new Error(`Erreur de la fonction Edge: ${invokeError.message}. Vérifiez les logs de la fonction.`);
        } else {
          throw new Error(`Erreur de communication: ${invokeError instanceof Error ? invokeError.message : 'Erreur inconnue'}`);
        }
      }

      setScanState(prev => ({ ...prev, progress: 75 }));

      const { data, error } = result;
      
      console.log('📊 DEBUG - RÉPONSE DÉTAILLÉE DE LA FONCTION EDGE:');
      console.log('Data:', data);
      console.log('Error:', error);
      
      if (error) {
        console.error("❌ DEBUG - Erreur de la fonction:", {
          error,
          message: error.message || 'Message indisponible',
          details: error.details || 'Détails indisponibles'
        });
        throw new Error(`Erreur lors du scan: ${error.message || error}`);
      }

      if (data?.error) {
        console.error("❌ DEBUG - Erreur dans les données:", data.error);
        throw new Error(`Erreur Gmail: ${data.error}`);
      }

      if (!data) {
        throw new Error("Aucune donnée reçue du serveur");
      }

      console.log('🔄 DEBUG - AVANT TRAITEMENT DES DONNÉES');
      
      // Traiter les résultats avec le handler dédié
      const processedResults = processRawScanData(data);
      
      console.log('🔄 DEBUG - APRÈS TRAITEMENT DES DONNÉES:');
      console.log('Résultats traités:', processedResults);
      
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
      
      let errorMessage = "Erreur lors du scan des emails";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Le scan a pris trop de temps et a été interrompu. Veuillez réessayer.";
        } else {
          errorMessage = error.message;
        }
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

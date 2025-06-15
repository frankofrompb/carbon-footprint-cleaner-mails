import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ScanResults } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useScanResultsHandler } from "./useScanResultsHandler";
import { useNavigate } from "react-router-dom";

interface ScanState {
  status: 'idle' | 'scanning' | 'completed' | 'error';
  results: ScanResults | null;
  error: string | null;
  progress: number;
}

export const useScanEmails = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { processRawScanData, validateScanResults } = useScanResultsHandler();
  const [scanState, setScanState] = useState<ScanState>({
    status: 'idle',
    results: null,
    error: null,
    progress: 0,
  });

  const scanEmails = useCallback(async (scanType?: 'smart-deletion' | 'sender-analysis' | 'smart-sorting' | 'intelligent-scan') => {
    console.log('🚀 useScanEmails - Démarrage du scan:', scanType);
    
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

      console.log('🔑 Token récupéré, longueur:', parsedAuth.accessToken.length);

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

      console.log(`📡 Appel de la fonction ${functionName}...`);

      // Simuler progression
      setScanState(prev => ({ ...prev, progress: 25 }));

      // Appeler la fonction Edge appropriée
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          accessToken: parsedAuth.accessToken
        }
      });

      setScanState(prev => ({ ...prev, progress: 75 }));

      console.log('📊 DONNÉES BRUTES REÇUES DE LA FONCTION:', {
        data: data,
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : 'pas de clés',
        error: error,
        totalEmails: data?.totalEmails,
        emailsCount: data?.emails?.length
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error(`Erreur lors du scan: ${error.message}`);
      }

      if (data?.error) {
        console.error("Gmail API error:", data.error);
        throw new Error(`Erreur Gmail: ${data.error}`);
      }

      // Traiter les résultats avec le handler dédié
      const processedResults = processRawScanData(data);
      
      // Valider les résultats
      if (!validateScanResults(processedResults)) {
        throw new Error("Les données reçues sont invalides");
      }

      console.log("✅ RÉSULTATS FINAUX TRAITÉS:", {
        totalEmails: processedResults.totalEmails,
        emailsCount: processedResults.emails.length,
        carbonFootprint: processedResults.carbonFootprint,
        hasSummary: !!processedResults.summary
      });

      setScanState({
        status: 'completed',
        results: processedResults,
        error: null,
        progress: 100,
      });

      // 🔥 NOUVELLE LOGIQUE: Stocker les résultats et rediriger vers la page de résultats
      localStorage.setItem('scanResults', JSON.stringify(processedResults));
      console.log('🔥 RÉSULTATS STOCKÉS DANS LOCALSTORAGE ET REDIRECTION VERS /scan-results');
      
      // Rediriger vers la page de résultats
      navigate('/scan-results');

      if (scanType === 'intelligent-scan') {
        toast({
          title: "Scan intelligent terminé",
          description: `${processedResults.totalEmails} emails trouvés : ${processedResults.summary?.oldUnreadEmails || 0} non lus +6 mois, ${processedResults.summary?.promotionalEmails || 0} promotionnels`,
        });
      } else {
        const emailText = (scanType === 'sender-analysis' || scanType === 'smart-sorting') ? "emails" : "emails non lus";
        toast({
          title: "Scan terminé",
          description: `${processedResults.totalEmails} ${emailText} trouvés dans votre boîte Gmail`,
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors du scan des emails", error);
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
  }, [toast, processRawScanData, validateScanResults, navigate]);

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


import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ScanResults, ScanState, EmailData } from "@/types";

// Pour cette démo, nous simulons un délai de traitement et des données aléatoires
const simulateEmailScan = (): Promise<ScanResults> => {
  return new Promise((resolve) => {
    // Simuler un délai de traitement
    setTimeout(() => {
      // Générer un nombre aléatoire d'emails entre 50 et 200
      const emailCount = Math.floor(Math.random() * 151) + 50;
      
      // Générer des données d'emails simulées
      const emails: EmailData[] = Array.from({ length: emailCount }, (_, i) => {
        // Date d'il y a plus d'un an
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));
        
        const randomSize = Math.floor(Math.random() * 1000) + 10; // Taille en Ko
        
        return {
          id: `email_${i}_${Date.now()}`,
          subject: `Email non lu #${i + 1}`,
          from: `expediteur${i + 1}@exemple.com`,
          date: date.toISOString(),
          size: randomSize
        };
      });
      
      // Calculer la taille totale en Mo
      const totalSizeMB = emails.reduce((acc, email) => acc + (email.size || 0), 0) / 1024;
      
      // Calculer l'empreinte carbone (10g par email)
      const carbonFootprint = emailCount * 10;
      
      resolve({
        totalEmails: emailCount,
        totalSizeMB,
        carbonFootprint,
        emails
      });
    }, 2000);
  });
};

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
      toast({
        title: "Scan démarré",
        description: "Recherche des emails non lus de plus d'un an...",
      });

      // Dans une vraie implémentation, nous ferions un appel à l'API Gmail ici
      const results = await simulateEmailScan();

      setScanState({
        isScanning: false,
        results,
        error: null,
      });

      toast({
        title: "Scan terminé",
        description: `${results.totalEmails} emails non lus trouvés, ${results.carbonFootprint}g de CO₂`,
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
        description: "Une erreur est survenue lors de la recherche des emails",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteEmails = useCallback(async () => {
    if (!scanState.results) return;

    try {
      toast({
        title: "Suppression en cours",
        description: `Suppression de ${scanState.results.totalEmails} emails...`,
      });

      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2500));

      toast({
        title: "Suppression terminée",
        description: `${scanState.results.totalEmails} emails supprimés avec succès, vous avez économisé ${scanState.results.carbonFootprint}g de CO₂!`,
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
        description: "Une erreur est survenue lors de la suppression des emails",
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
      link.setAttribute("download", `emails_non_lus_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: "Le fichier CSV a été téléchargé avec succès",
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

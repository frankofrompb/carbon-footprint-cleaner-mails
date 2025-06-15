
import { useState, useCallback } from "react";
import { ScanResults } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export const useScanResultsHandler = () => {
  const { toast } = useToast();

  const processRawScanData = useCallback((rawData: any): ScanResults => {
    console.log('🔄 useScanResultsHandler - Traitement des données brutes:', {
      type: typeof rawData,
      keys: rawData ? Object.keys(rawData) : 'aucune clé',
      totalEmails: rawData?.totalEmails,
      emailsLength: rawData?.emails?.length,
      summary: rawData?.summary
    });

    // S'assurer que nous avons des données valides
    if (!rawData) {
      console.error('❌ Aucune donnée reçue');
      return {
        totalEmails: 0,
        emails: [],
        carbonFootprint: 0,
        totalSizeMB: 0,
        summary: {
          oldUnreadEmails: 0,
          promotionalEmails: 0,
          socialEmails: 0,
          notificationEmails: 0,
          spamEmails: 0,
          autoClassifiableEmails: 0,
          duplicateSenderEmails: 0
        }
      };
    }

    // Traiter et valider les données
    const processedResults: ScanResults = {
      totalEmails: rawData.totalEmails || 0,
      emails: Array.isArray(rawData.emails) ? rawData.emails : [],
      carbonFootprint: rawData.carbonFootprint || 0,
      totalSizeMB: rawData.totalSizeMB || 0,
      summary: rawData.summary || {
        oldUnreadEmails: 0,
        promotionalEmails: 0,
        socialEmails: 0,
        notificationEmails: 0,
        spamEmails: 0,
        autoClassifiableEmails: 0,
        duplicateSenderEmails: 0
      }
    };

    console.log('✅ useScanResultsHandler - Données traitées:', {
      totalEmails: processedResults.totalEmails,
      emailsCount: processedResults.emails.length,
      summaryKeys: processedResults.summary ? Object.keys(processedResults.summary) : 'pas de summary',
      carbonFootprint: processedResults.carbonFootprint
    });

    return processedResults;
  }, []);

  const validateScanResults = useCallback((results: ScanResults): boolean => {
    const isValid = results && 
                   typeof results.totalEmails === 'number' && 
                   Array.isArray(results.emails) &&
                   typeof results.carbonFootprint === 'number';

    console.log('🔍 Validation des résultats:', {
      isValid,
      totalEmails: results?.totalEmails,
      hasEmails: Array.isArray(results?.emails),
      emailsCount: results?.emails?.length,
      hasSummary: !!results?.summary
    });

    if (!isValid) {
      toast({
        title: "Erreur de données",
        description: "Les résultats du scan sont invalides",
        variant: "destructive",
      });
    }

    return isValid;
  }, [toast]);

  return {
    processRawScanData,
    validateScanResults
  };
};


import { useState, useCallback } from "react";
import { ScanResults } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export const useScanResultsHandler = () => {
  const { toast } = useToast();

  const processRawScanData = useCallback((rawData: any): ScanResults => {
    console.log('🔍 DEBUG useScanResultsHandler - DONNÉES BRUTES REÇUES:');
    console.log('Type:', typeof rawData);
    console.log('Null/undefined:', rawData === null || rawData === undefined);
    console.log('Clés disponibles:', rawData ? Object.keys(rawData) : 'AUCUNE CLÉ');
    console.log('totalEmails:', rawData?.totalEmails);
    console.log('emails array:', rawData?.emails);
    console.log('Premier email si disponible:', rawData?.emails?.[0]);
    console.log('Longueur du tableau emails:', rawData?.emails?.length);
    
    if (rawData?.emails && Array.isArray(rawData.emails)) {
      console.log('🧪 DÉTAILS DES 3 PREMIERS EMAILS:');
      rawData.emails.slice(0, 3).forEach((email: any, index: number) => {
        console.log(`Email ${index + 1}:`, {
          id: email?.id,
          subject: email?.subject,
          from: email?.from,
          date: email?.date
        });
      });
    }

    // S'assurer que nous avons des données valides
    if (!rawData) {
      console.error('❌ ERREUR: Aucune donnée reçue - retour des données par défaut');
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

    console.log('✅ DONNÉES TRAITÉES FINALES:');
    console.log('totalEmails:', processedResults.totalEmails);
    console.log('emails count:', processedResults.emails.length);
    console.log('Premier email traité:', processedResults.emails[0]);
    console.log('Summary:', processedResults.summary);

    return processedResults;
  }, []);

  const validateScanResults = useCallback((results: ScanResults): boolean => {
    const isValid = results && 
                   typeof results.totalEmails === 'number' && 
                   Array.isArray(results.emails) &&
                   typeof results.carbonFootprint === 'number';

    console.log('🔍 VALIDATION DES RÉSULTATS:');
    console.log('isValid:', isValid);
    console.log('totalEmails type:', typeof results?.totalEmails);
    console.log('emails is Array:', Array.isArray(results?.emails));
    console.log('carbonFootprint type:', typeof results?.carbonFootprint);
    console.log('emails count après validation:', results?.emails?.length);

    if (!isValid) {
      console.error('❌ VALIDATION ÉCHOUÉE - Données invalides');
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

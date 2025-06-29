
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
    console.log('Summary brut:', rawData?.summary);
    console.log('Premier email si disponible:', rawData?.emails?.[0]);
    console.log('Longueur du tableau emails:', rawData?.emails?.length);
    
    if (rawData?.emails && Array.isArray(rawData.emails)) {
      console.log('🧪 ANALYSE DES EMAILS POUR VÉRIFICATION:');
      const unreadEmails = rawData.emails.filter((email: any) => email.isUnread);
      const oldEmails = rawData.emails.filter((email: any) => email.daysSinceReceived > 180);
      const oldUnreadEmails = rawData.emails.filter((email: any) => 
        email.isUnread && email.daysSinceReceived > 180
      );
      
      console.log(`   📧 Total emails: ${rawData.emails.length}`);
      console.log(`   📧 Emails non lus: ${unreadEmails.length}`);
      console.log(`   📧 Emails > 180 jours: ${oldEmails.length}`);
      console.log(`   📧 Emails non lus ET > 180 jours: ${oldUnreadEmails.length}`);
      console.log(`   📧 Summary.oldUnreadEmails: ${rawData.summary?.oldUnreadEmails}`);
      
      if (oldUnreadEmails.length > 0) {
        console.log('🔍 DÉTAILS DES EMAILS NON LUS ANCIENS:');
        oldUnreadEmails.slice(0, 3).forEach((email: any, index: number) => {
          console.log(`   Email ${index + 1}:`, {
            subject: email?.subject?.substring(0, 50),
            from: email?.from?.substring(0, 30),
            isUnread: email?.isUnread,
            daysSinceReceived: email?.daysSinceReceived,
            classification: email?.classification?.category
          });
        });
      }
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

    // CORRECTION: Recalculer les statistiques côté client pour être sûr
    const emails = Array.isArray(rawData.emails) ? rawData.emails : [];
    const calculatedSummary = {
      oldUnreadEmails: emails.filter((e: any) => e.isUnread && e.daysSinceReceived > 180).length,
      promotionalEmails: emails.filter((e: any) => e.classification?.category === 'promotional').length,
      socialEmails: emails.filter((e: any) => e.classification?.category === 'social').length,
      notificationEmails: emails.filter((e: any) => e.classification?.category === 'notification').length,
      spamEmails: emails.filter((e: any) => e.classification?.category === 'spam').length,
      autoClassifiableEmails: emails.filter((e: any) => e.classification?.category !== 'other').length,
      duplicateSenderEmails: 0
    };

    console.log('🔄 RECALCUL CÔTÉ CLIENT:');
    console.log('   Summary original:', rawData.summary);
    console.log('   Summary recalculé:', calculatedSummary);

    // Traiter et valider les données
    const processedResults: ScanResults = {
      totalEmails: rawData.totalEmails || 0,
      emails: emails,
      carbonFootprint: rawData.carbonFootprint || 0,
      totalSizeMB: rawData.totalSizeMB || 0,
      summary: calculatedSummary // Utiliser le summary recalculé
    };

    console.log('✅ DONNÉES TRAITÉES FINALES:');
    console.log('totalEmails:', processedResults.totalEmails);
    console.log('emails count:', processedResults.emails.length);
    console.log('Premier email traité:', processedResults.emails[0]);
    console.log('Summary FINAL:', processedResults.summary);
    console.log('📧 EMAILS NON LUS ANCIENS FINAL:', processedResults.summary.oldUnreadEmails);

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
    console.log('oldUnreadEmails après validation:', results?.summary?.oldUnreadEmails);

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

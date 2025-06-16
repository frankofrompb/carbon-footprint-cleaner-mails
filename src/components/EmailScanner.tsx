
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScanState } from "@/types";
import IntelligentScanDisplay from "./scan/IntelligentScanDisplay";

interface EmailScannerProps {
  scanState: ScanState;
  onScan: () => void;
  onDelete: (emailIds: string[]) => void;
  onExport: () => void;
  userEmail: string | null;
  scanType?: string;
}

const EmailScanner = ({ scanState, onScan, onDelete, onExport, userEmail, scanType }: EmailScannerProps) => {
  console.log('📊 EmailScanner - État du scan:', {
    status: scanState.status,
    scanType: scanType,
    hasResults: !!scanState.results,
    totalEmails: scanState.results?.totalEmails,
    emailsCount: scanState.results?.emails?.length
  });

  // LOGS DE DEBUG DÉTAILLÉS POUR LE PROBLÈME D'AFFICHAGE
  console.log('🔍 EmailScanner - DEBUG AFFICHAGE COMPLET:', {
    statusEst: scanState.status,
    statusEstCompleted: scanState.status === 'completed',
    aDesResultats: !!scanState.results,
    scanTypeEst: scanType,
    scanTypeEstIntelligent: scanType === 'intelligent-scan',
    conditionComplete: scanState.status === 'completed' && scanState.results && scanType === 'intelligent-scan',
    scanStateComplet: scanState
  });

  if (scanState.status === 'completed' && scanState.results) {
    console.log('✅ EmailScanner - SCAN TERMINÉ - DÉTAILS COMPLETS:', {
      totalEmails: scanState.results.totalEmails,
      emailsLength: scanState.results.emails?.length,
      scanType: scanType,
      userEmail: userEmail,
      premierEmail: scanState.results.emails?.[0] ? {
        id: scanState.results.emails[0].id,
        subject: scanState.results.emails[0].subject?.substring(0, 50),
        from: scanState.results.emails[0].from?.substring(0, 30)
      } : 'AUCUN EMAIL',
      shouldShowIntelligentDisplay: scanType === 'intelligent-scan'
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analyse intelligente de la boite Gmail</h2>
      </div>

      {/* Statut actuel toujours visible */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 font-medium">🔍 Statut actuel: {scanState.status}</p>
        {scanState.results && (
          <p className="text-blue-600 text-sm">
            Résultats disponibles: {scanState.results.totalEmails} emails totaux
          </p>
        )}
      </div>

      {scanState.status === 'idle' && (
        <div className="text-center">
          <p className="text-muted-foreground">Prêt à analyser votre boîte Gmail avec intelligence artificielle.</p>
          <Button onClick={onScan}>Commencer l'analyse intelligente</Button>
        </div>
      )}

      {scanState.status === 'scanning' && (
        <div className="space-y-4">
          <p className="text-center">Analyse intelligente en cours... ({scanState.progress}%)</p>
          <Progress value={scanState.progress} />
        </div>
      )}

      {scanState.status === 'completed' && scanState.results && (
        <div className="space-y-6">
          {scanType === 'intelligent-scan' ? (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">🎯 AFFICHAGE IntelligentScanDisplay</p>
                <p className="text-green-600 text-sm">
                  Données à transmettre: {scanState.results.totalEmails} emails totaux, 
                  {scanState.results.emails?.length} emails traités
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Premier email: {scanState.results.emails?.[0]?.subject}
                </p>
              </div>
              <IntelligentScanDisplay
                results={scanState.results}
                userEmail={userEmail}
                onDeleteSelected={onDelete}
                onExport={onExport}
              />
            </>
          ) : (
            <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
              <p className="text-lg font-semibold text-gray-600">
                Affichage standard non implémenté pour ce type de scan
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Utilisez le scan intelligent pour voir les résultats détaillés
              </p>
            </div>
          )}
        </div>
      )}

      {scanState.status === 'error' && (
        <div className="text-center text-red-500">
          <p>Erreur lors de l'analyse : {scanState.error}</p>
          <Button onClick={onScan} className="mt-4">Réessayer</Button>
        </div>
      )}
    </div>
  );
};

export default EmailScanner;

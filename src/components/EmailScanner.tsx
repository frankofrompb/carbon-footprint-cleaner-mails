
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
  // LOG CRITIQUE : Vérifier si ce composant est affiché
  console.log('🚨 COMPOSANT EmailScanner RENDU ! scanType:', scanType, 'status:', scanState.status);

  console.log('📊 EmailScanner - État du scan:', {
    status: scanState.status,
    scanType: scanType,
    hasResults: !!scanState.results,
    totalEmails: scanState.results?.totalEmails,
    emailsCount: scanState.results?.emails?.length
  });

  // NOUVEAU DEBUG: Vérifier les données complètes
  if (scanState.results) {
    console.log('🔍 EmailScanner - DÉTAILS COMPLETS DES RÉSULTATS:', {
      totalEmails: scanState.results.totalEmails,
      emailsArray: scanState.results.emails,
      firstEmailSubject: scanState.results.emails?.[0]?.subject,
      firstEmailFrom: scanState.results.emails?.[0]?.from,
      summary: scanState.results.summary,
      carbonFootprint: scanState.results.carbonFootprint
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analyse de la boite mail</h2>
      </div>

      {/* LOG VISIBLE DANS L'UI POUR FORCER L'AFFICHAGE */}
      <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
        <h3 className="font-bold text-red-800">🚨 COMPOSANT EmailScanner AFFICHÉ</h3>
        <p><strong>Status:</strong> {scanState.status}</p>
        <p><strong>ScanType:</strong> {scanType || 'undefined'}</p>
      </div>

      {scanState.status === 'idle' && (
        <div className="text-center">
          <p className="text-muted-foreground">Prêt à scanner votre boîte mail.</p>
          <Button onClick={onScan}>Commencer l'analyse</Button>
        </div>
      )}

      {scanState.status === 'scanning' && (
        <div className="space-y-4">
          <p className="text-center">Analyse en cours... ({scanState.progress}%)</p>
          <Progress value={scanState.progress} />
        </div>
      )}

      {scanState.status === 'completed' && scanState.results && (
        <div className="space-y-6">
          {/* DEBUG VISIBLE DANS L'UI */}
          <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <h3 className="font-bold text-yellow-800">🔍 DEBUG EmailScanner</h3>
            <p><strong>scanType:</strong> {scanType}</p>
            <p><strong>Utilise IntelligentScanDisplay:</strong> {scanType === 'intelligent-scan' ? 'OUI' : 'NON'}</p>
            <p><strong>Nombre d'emails:</strong> {scanState.results.emails?.length || 0}</p>
            <p><strong>Premier email:</strong> {scanState.results.emails?.[0]?.subject || 'Aucun'}</p>
          </div>

          {scanType === 'intelligent-scan' ? (
            <IntelligentScanDisplay
              results={scanState.results}
              userEmail={userEmail}
              onDeleteSelected={onDelete}
              onExport={onExport}
            />
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

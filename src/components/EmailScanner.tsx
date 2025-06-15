
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScanState } from "@/types";
import IntelligentScanResults from "./IntelligentScanResults";

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

  const handleOrganizeSelected = (emailIds: string[]) => {
    console.log('🗂️ Organisation demandée pour:', emailIds.length, 'emails');
    // TODO: Implémenter l'organisation des emails
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analyse de la boite mail</h2>
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
          {scanType === 'intelligent-scan' ? (
            <IntelligentScanResults
              results={scanState.results}
              onDeleteSelected={onDelete}
              onOrganizeSelected={handleOrganizeSelected}
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

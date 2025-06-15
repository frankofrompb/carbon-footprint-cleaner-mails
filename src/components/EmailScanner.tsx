
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

const EmailScanner = ({ scanState, onScan, onDelete, onExport, userEmail }: EmailScannerProps) => {
  console.log('📊 EmailScanner - État du scan:', {
    status: scanState.status,
    hasResults: !!scanState.results,
    totalEmails: scanState.results?.totalEmails,
    emailsCount: scanState.results?.emails?.length
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Nettoyez votre boîte mail intelligemment
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Connecté en tant que <span className="font-semibold">{userEmail}</span>
        </p>
      </div>

      {scanState.status === 'idle' && (
        <div className="text-center space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
            <p className="text-white text-lg mb-6">
              Prêt à scanner votre boîte mail avec notre IA intelligente
            </p>
            <Button 
              onClick={onScan}
              className="bg-white text-[#38c39d] hover:bg-white/90 text-lg px-8 py-3"
            >
              Commencer l'analyse intelligente
            </Button>
          </div>
        </div>
      )}

      {scanState.status === 'scanning' && (
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
            <p className="text-white text-lg mb-4">
              Analyse intelligente en cours... ({scanState.progress}%)
            </p>
            <Progress value={scanState.progress} className="w-full" />
            <p className="text-white/70 text-sm mt-2">
              Détection des emails non lus +6 mois, classification automatique...
            </p>
          </div>
        </div>
      )}

      {scanState.status === 'completed' && scanState.results && (
        <div className="bg-white/95 backdrop-blur-md rounded-lg p-6">
          <IntelligentScanResults
            results={scanState.results}
            onDeleteSelected={onDelete}
            onOrganizeSelected={onDelete}
          />
        </div>
      )}

      {scanState.status === 'error' && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
          <p className="text-red-200 text-lg mb-4">
            Erreur lors de l'analyse : {scanState.error}
          </p>
          <Button 
            onClick={onScan} 
            className="bg-white text-[#38c39d] hover:bg-white/90"
          >
            Réessayer
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailScanner;

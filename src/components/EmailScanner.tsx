
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { ScanState } from "@/types";
import IntelligentScanResults from "./IntelligentScanResults";

interface EmailScannerProps {
  scanState: ScanState;
  onScan: () => void;
  onDelete: (emailIds: string[]) => void;
  onExport: () => void;
  userEmail: string | null;
  scanType?: string;
  onBackToSelection?: () => void;
}

const getScanTitle = (scanType?: string) => {
  switch (scanType) {
    case 'intelligent-scan':
      return 'Scan Intelligent';
    case 'smart-deletion':
      return 'Suppression Intelligente';
    case 'sender-analysis':
      return 'Analyse des Expéditeurs';
    case 'smart-sorting':
      return 'Tri Intelligent';
    default:
      return 'Analyse des emails';
  }
};

const getScanDescription = (scanType?: string) => {
  switch (scanType) {
    case 'intelligent-scan':
      return 'Détection automatique des emails non lus depuis +6 mois, classification des promotions, réseaux sociaux et spam';
    case 'smart-deletion':
      return 'Analyse des emails non lus depuis plus d\'un an pour suppression automatique';
    case 'sender-analysis':
      return 'Classification des expéditeurs par fréquence et pertinence';
    case 'smart-sorting':
      return 'Organisation automatique des emails par dossiers intelligents';
    default:
      return 'Analyse de votre boîte mail';
  }
};

const EmailScanner = ({ scanState, onScan, onDelete, onExport, userEmail, scanType, onBackToSelection }: EmailScannerProps) => {
  console.log('📊 EmailScanner - État du scan:', {
    status: scanState.status,
    hasResults: !!scanState.results,
    totalEmails: scanState.results?.totalEmails,
    emailsCount: scanState.results?.emails?.length,
    scanType
  });

  return (
    <div className="space-y-6">
      {onBackToSelection && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBackToSelection}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la sélection
          </Button>
        </div>
      )}

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          {getScanTitle(scanType)}
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Connecté en tant que <span className="font-semibold">{userEmail}</span>
        </p>
      </div>

      {scanState.status === 'idle' && (
        <div className="text-center space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
            <p className="text-white text-lg mb-6">
              {getScanDescription(scanType)}
            </p>
            <Button 
              onClick={onScan}
              className="bg-white text-[#38c39d] hover:bg-white/90 text-lg px-8 py-3"
            >
              Commencer l'analyse
            </Button>
          </div>
        </div>
      )}

      {scanState.status === 'scanning' && (
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
            <p className="text-white text-lg mb-4">
              Analyse en cours... ({scanState.progress}%)
            </p>
            <Progress value={scanState.progress} className="w-full" />
            <p className="text-white/70 text-sm mt-2">
              {getScanDescription(scanType)}
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

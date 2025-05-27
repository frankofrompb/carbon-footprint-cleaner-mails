
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, FolderOpen, Brain } from "lucide-react";

interface ScanTypeSelectorProps {
  onSelectScanType: (scanType: 'smart-deletion' | 'sender-analysis' | 'smart-sorting') => void;
  userEmail: string;
}

const ScanTypeSelector = ({ onSelectScanType, userEmail }: ScanTypeSelectorProps) => {
  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Bienvenue <span className="text-[#38c39d]">{userEmail}</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Choisissez le type de nettoyage que vous souhaitez effectuer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Suppression Intelligente */}
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="text-center">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl mb-4 group-hover:shadow-xl transition-all duration-300 border border-red-200">
              <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-red-700">Suppression Intelligente</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-red-600 mb-4">
              Détection automatique des emails non lus depuis plus d'un an
            </p>
            <Button 
              onClick={() => onSelectScanType('smart-deletion')}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              Commencer la suppression
            </Button>
          </CardContent>
        </Card>

        {/* Analyse des Expéditeurs */}
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl mb-4 group-hover:shadow-xl transition-all duration-300 border border-blue-200">
              <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-blue-700">Analyse des Expéditeurs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-blue-600 mb-4">
              Classer vos mails les plus fréquents (spam, désabonnement ou à conserver)
            </p>
            <Button 
              onClick={() => onSelectScanType('sender-analysis')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Analyser les expéditeurs
            </Button>
          </CardContent>
        </Card>

        {/* Tri Intelligent */}
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="text-center">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl mb-4 group-hover:shadow-xl transition-all duration-300 border border-green-200">
              <div className="bg-[#38c39d] w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-green-700">Tri Intelligent</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-green-600 mb-4">
              Classification automatique des anciens emails par dossier
            </p>
            <Button 
              onClick={() => onSelectScanType('smart-sorting')}
              className="w-full bg-[#38c39d] hover:bg-[#2ea082] text-white"
            >
              Organiser mes emails
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanTypeSelector;

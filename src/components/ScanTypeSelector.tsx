
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  FolderOpen, 
  Brain, 
  Search,
  Calendar,
  Mail,
  Users,
  AlertTriangle
} from "lucide-react";

type ScanType = 'smart-deletion' | 'sender-analysis' | 'smart-sorting' | 'intelligent-scan';

interface ScanTypeSelectorProps {
  onSelectScanType: (scanType: ScanType) => void;
  userEmail: string;
  onScan: () => void;
}

const ScanTypeSelector = ({ onSelectScanType, userEmail, onScan }: ScanTypeSelectorProps) => {
  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Nettoyez votre boîte mail intelligemment
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choisissez le type d'analyse qui correspond à vos besoins. 
          Connecté en tant que <span className="font-semibold text-eco-blue">{userEmail}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Scan Intelligent - NOUVEAU */}
        <Card className="border-2 border-green-200 bg-green-50 hover:border-green-300 transition-all duration-300 transform hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-green-700 flex items-center justify-center gap-2">
              <span>Scan Intelligent</span>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">NOUVEAU</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-green-700">
              Détection automatique des emails non lus depuis +6 mois, classification des promotions, réseaux sociaux et spam
            </p>
            <div className="space-y-2 text-xs text-green-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Non lus +6 mois</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>Promotions & newsletters</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>Réseaux sociaux</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                <span>Spam potentiel</span>
              </div>
            </div>
            <Button 
              onClick={() => onSelectScanType('intelligent-scan')}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Search className="mr-2 h-4 w-4" />
              Scan Intelligent
            </Button>
          </CardContent>
        </Card>

        {/* Suppression Intelligente */}
        <Card className="border-2 border-red-200 bg-red-50 hover:border-red-300 transition-all duration-300 transform hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-red-700">Suppression Intelligente</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-red-700">
              Analyse des emails non lus depuis plus d'un an pour suppression automatique
            </p>
            <div className="text-xs text-red-600 space-y-1">
              <div>• Emails anciens non ouverts</div>
              <div>• Newsletters inactives</div>
              <div>• Suppression sécurisée</div>
            </div>
            <Button 
              onClick={() => onSelectScanType('smart-deletion')}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </CardContent>
        </Card>

        {/* Analyse des Expéditeurs */}
        <Card className="border-2 border-blue-200 bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-blue-700">Analyse des Expéditeurs</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-blue-700">
              Classification des expéditeurs par fréquence et pertinence
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <div>• Statistiques par expéditeur</div>
              <div>• Taux d'ouverture</div>
              <div>• Suggestions de désabonnement</div>
            </div>
            <Button 
              onClick={() => onSelectScanType('sender-analysis')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Analyser
            </Button>
          </CardContent>
        </Card>

        {/* Tri Intelligent */}
        <Card className="border-2 border-purple-200 bg-purple-50 hover:border-purple-300 transition-all duration-300 transform hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-purple-700">Tri Intelligent</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-purple-700">
              Organisation automatique des emails par dossiers intelligents
            </p>
            <div className="text-xs text-purple-600 space-y-1">
              <div>• IA de classification</div>
              <div>• Dossiers automatiques</div>
              <div>• Règles personnalisables</div>
            </div>
            <Button 
              onClick={() => onSelectScanType('smart-sorting')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Brain className="mr-2 h-4 w-4" />
              Organiser
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanTypeSelector;


import { Trash2, FolderOpen, Brain } from "lucide-react";

const VirtuousCircle = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Les trois blocs en ligne avec ligne de connexion */}
      <div className="relative">
        {/* Ligne verte de connexion en arrière-plan */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#38c39d] transform -translate-y-1/2 z-0"></div>
        
        {/* Les trois blocs disposés en ligne */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 z-10">
          
          {/* Bloc 1: Suppression */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg mb-4 hover:shadow-xl transition-all duration-300 border border-red-200">
              <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-red-700">Suppression Intelligente</h3>
              <p className="text-sm text-red-600">
                Détection automatique des emails non lus depuis plus d'un an
              </p>
            </div>
          </div>

          {/* Bloc 2: Analyse */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg mb-4 hover:shadow-xl transition-all duration-300 border border-blue-200">
              <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-blue-700">Analyse des Expéditeurs</h3>
              <p className="text-sm text-blue-600">
                Classer vos mails les plus fréquents (spam, desabonnement ou à conserver)
              </p>
            </div>
          </div>

          {/* Bloc 3: Tri */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg mb-4 hover:shadow-xl transition-all duration-300 border border-green-200">
              <div className="bg-[#38c39d] w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-green-700">Tri Intelligent</h3>
              <p className="text-sm text-green-600">
                Classification automatique des anciens emails par dossier
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtuousCircle;

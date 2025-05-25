
import { Trash2, UserCheck, Brain } from "lucide-react";

const VirtuousCircle = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Titre principal */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-[#38c39d]">Le Cercle Vertueux du Nettoyage Email</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Une approche intelligente pour réduire votre empreinte carbone numérique
        </p>
      </div>

      {/* Cercle vertueux avec les trois blocs */}
      <div className="relative">
        {/* Cercle central décoratif */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-dashed border-[#38c39d]/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[#38c39d] text-sm font-semibold">Cycle</div>
              <div className="text-[#38c39d] text-sm font-semibold">Vertueux</div>
            </div>
          </div>
        </div>

        {/* Les trois blocs disposés en triangle */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center min-h-[400px]">
          
          {/* Bloc 1: Suppression */}
          <div className="md:col-start-2 flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg mb-4 hover:shadow-xl transition-all duration-300 border border-red-200">
              <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-red-700">Suppression Intelligente</h3>
              <p className="text-sm text-red-600">
                Suppression automatique des emails non lus depuis plus d'un an
              </p>
            </div>
          </div>

          {/* Bloc 2: Analyse */}
          <div className="md:row-start-2 flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg mb-4 hover:shadow-xl transition-all duration-300 border border-blue-200">
              <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-blue-700">Analyse des Expéditeurs</h3>
              <p className="text-sm text-blue-600">
                Identification des expéditeurs fréquents et gestion des abonnements
              </p>
            </div>
          </div>

          {/* Bloc 3: Tri */}
          <div className="md:col-start-3 md:row-start-2 flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg mb-4 hover:shadow-xl transition-all duration-300 border border-green-200">
              <div className="bg-[#38c39d] w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-green-700">Tri Intelligent</h3>
              <p className="text-sm text-green-600">
                Classification automatique des anciens emails selon leur importance
              </p>
            </div>
          </div>
        </div>

        {/* Flèches connectant les blocs (visibles uniquement sur desktop) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          {/* Flèche 1 -> 2 */}
          <div className="absolute top-1/3 left-1/4 w-20 h-0.5 bg-[#38c39d]/40 transform rotate-45"></div>
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#38c39d]/40 transform rotate-45 translate-x-20"></div>
          
          {/* Flèche 2 -> 3 */}
          <div className="absolute bottom-1/3 right-1/4 w-20 h-0.5 bg-[#38c39d]/40 transform -rotate-45"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#38c39d]/40 transform -rotate-45 translate-x-20"></div>
          
          {/* Flèche 3 -> 1 */}
          <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-[#38c39d]/40 transform -rotate-90"></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#38c39d]/40 transform -rotate-90 -translate-y-16"></div>
        </div>
      </div>

      {/* Message de bénéfice environnemental */}
      <div className="text-center mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
        <h4 className="text-xl font-semibold text-[#38c39d] mb-2">Impact Environnemental</h4>
        <p className="text-muted-foreground">
          Chaque email supprimé réduit votre empreinte carbone de 4g de CO₂. 
          Ensemble, créons un internet plus vert !
        </p>
      </div>
    </div>
  );
};

export default VirtuousCircle;

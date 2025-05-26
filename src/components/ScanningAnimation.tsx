
import { Search, Mail } from "lucide-react";

const ScanningAnimation = () => {
  return (
    <div className="flex flex-col items-center space-y-6 py-12">
      {/* Animation de la loupe qui examine les emails */}
      <div className="relative w-64 h-32">
        {/* Emails dispersés */}
        <div className="absolute top-0 left-8 opacity-70">
          <Mail className="h-6 w-6 text-blue-400 animate-pulse" style={{ animationDelay: '0s' }} />
        </div>
        <div className="absolute top-4 right-12 opacity-60">
          <Mail className="h-5 w-5 text-green-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute bottom-8 left-16 opacity-80">
          <Mail className="h-7 w-7 text-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-2 right-8 opacity-50">
          <Mail className="h-6 w-6 text-orange-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="absolute top-8 center opacity-70">
          <Mail className="h-6 w-6 text-red-400 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Loupe qui se déplace */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative animate-[spin_3s_linear_infinite]">
            <Search className="h-12 w-12 text-[#38c39d] drop-shadow-lg" />
            {/* Effet de brillance sur la loupe */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-[slide-in-right_2s_ease-in-out_infinite]"></div>
          </div>
        </div>

        {/* Cercles concentriques pour l'effet de scan */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-24 h-24 border-2 border-[#38c39d] opacity-30 rounded-full animate-ping"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 border border-[#38c39d] opacity-20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Texte d'état */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-700">
          Analyse en cours...
        </h3>
        <p className="text-sm text-gray-500 animate-pulse">
          Recherche de tous vos emails non lus
        </p>
      </div>

      {/* Barre de progression stylisée */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#38c39d] to-[#6366f1] rounded-full animate-[slide-in-right_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default ScanningAnimation;


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  useEffect(() => {
    console.log("🔄 Page de callback d'authentification chargée");
    
    // Attendre que l'authentification soit complètement traitée
    if (authState.userEmail) {
      console.log("✅ Authentification réussie, redirection vers dashboard");
      navigate("/dashboard", { replace: true });
    } else if (!authState.loading) {
      console.log("❌ Pas d'authentification détectée, redirection vers accueil");
      // Si pas en cours de chargement et pas authentifié, rediriger après un délai
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
    }
  }, [authState.userEmail, authState.loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#38c39d] to-[#2d8b61]">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold mb-4">
          Authentification en cours...
        </h1>
        <p className="text-white/80">
          Veuillez patienter pendant que nous finalisons votre connexion.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

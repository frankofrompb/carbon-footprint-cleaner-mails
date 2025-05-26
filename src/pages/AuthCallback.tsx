
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  useEffect(() => {
    // Attendre que l'authentification soit complètement traitée
    if (authState.isAuthenticated) {
      // Authentification réussie, rediriger vers la page d'accueil
      navigate("/", { replace: true });
    } else if (authState.error) {
      // Erreur d'authentification, rediriger aussi vers la page d'accueil
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } else if (!authState.loading) {
      // Si pas en cours de chargement et pas authentifié, il y a peut-être eu un problème
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 5000);
    }
  }, [authState.isAuthenticated, authState.error, authState.loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38c39d] mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">
          {authState.error ? "Erreur d'authentification" : "Authentification en cours..."}
        </h1>
        <p className="text-gray-600">
          {authState.error 
            ? "Une erreur s'est produite. Redirection..." 
            : "Veuillez patienter pendant que nous finalisons votre connexion."
          }
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

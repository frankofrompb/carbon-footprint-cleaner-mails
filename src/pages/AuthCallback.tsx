
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Le hook useAuth gère déjà le callback dans son useEffect
    // Nous redirigeons simplement vers la page d'accueil
    // après un court délai pour laisser le temps au hook de traiter
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38c39d] mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Authentification en cours...</h1>
        <p className="text-gray-600">Veuillez patienter pendant que nous finalisons votre connexion.</p>
      </div>
    </div>
  );
};

export default AuthCallback;

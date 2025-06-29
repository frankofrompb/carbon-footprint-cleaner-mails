
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import ModernLandingPage from "@/components/ModernLandingPage";

const ScanPage = () => {
  const { authState, loginWithGmail, logout } = useAuth();
  const navigate = useNavigate();

  // Si l'utilisateur n'est pas connecté, afficher la landing page avec connexion
  if (!authState.userEmail) {
    return (
      <div className="min-h-screen flex flex-col">
        <ModernLandingPage 
          onLoginWithGmail={loginWithGmail}
          isLoading={authState.loading}
        />
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher la page de scan
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isAuthenticated={!!authState.userEmail}
        userEmail={authState.userEmail}
        onLogout={logout}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Analyse de votre boîte mail</h1>
          <p className="text-lg text-gray-600 mb-8">
            Connecté en tant que : {authState.userEmail}
          </p>
          <p className="text-gray-500">
            Fonctionnalité de scan en cours de développement...
          </p>
        </div>
      </main>
    </div>
  );
};

export default ScanPage;


import ModernLandingPage from "@/components/ModernLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { authState, loginWithGmail } = useAuth();
  const navigate = useNavigate();

  // Si l'utilisateur est connecté, rediriger vers le dashboard
  useEffect(() => {
    if (authState.userEmail) {
      navigate('/dashboard');
    }
  }, [authState.userEmail, navigate]);

  const handleLoginWithGmail = () => {
    loginWithGmail();
  };

  // Si l'utilisateur est connecté, ne pas afficher la landing page
  if (authState.userEmail) {
    return null; // Le useEffect redirigera
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ModernLandingPage 
        onLoginWithGmail={handleLoginWithGmail}
        isLoading={authState.loading}
      />
    </div>
  );
};

export default Index;

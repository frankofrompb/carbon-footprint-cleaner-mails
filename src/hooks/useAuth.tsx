
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ServiceType } from "@/components/ServiceSelector";

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: null,
    loading: false,
  });

  const loginWithGmail = useCallback(async (serviceType: ServiceType) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      console.log("🔐 Démarrage de l'authentification Gmail pour le service:", serviceType);

      // Configuration OAuth pour Gmail
      const clientId = "397735068318-qkgn79j4l1i0ndn7gq4pe4t8oqnvp5nt.apps.googleusercontent.com";
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      // Scopes Gmail pour lire et gérer les emails
      const scope = "https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${serviceType}`; // Passer le type de service dans l'état

      // Rediriger vers Google OAuth
      window.location.href = authUrl;

    } catch (error) {
      console.error("Erreur lors de l'authentification", error);
      setAuthState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la connexion avec Gmail",
        variant: "destructive",
      });
    }
  }, [toast]);

  const logout = useCallback(() => {
    localStorage.removeItem("emailCleanerAuth");
    setAuthState({
      isAuthenticated: false,
      userEmail: null,
      loading: false,
    });

    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
  }, [toast]);

  // Vérifier l'authentification au chargement
  const checkAuth = useCallback(() => {
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth.accessToken && parsedAuth.userEmail) {
          setAuthState({
            isAuthenticated: true,
            userEmail: parsedAuth.userEmail,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification", error);
        localStorage.removeItem("emailCleanerAuth");
      }
    }
  }, []);

  return {
    authState,
    loginWithGmail,
    logout,
    checkAuth,
  };
};

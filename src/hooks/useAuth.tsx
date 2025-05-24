
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AuthState } from "@/types";

// Remplacer VOTRE_CLIENT_ID_GMAIL par l'ID client fourni par Google Cloud Console
const GMAIL_CLIENT_ID = "380256615541-t5q64hmeiamv9ae6detja5oofnn315t6.apps.googleusercontent.com"; // Remplacez cette valeur par votre vrai Client ID
const GMAIL_REDIRECT_URI = "https://carbon-footprint-cleaner-mails.lovable.app/auth/callback";

// Périmètre des autorisations nécessaires pour Gmail
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
].join(" ");

export const useAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    provider: null,
    userEmail: null,
    accessToken: null,
    loading: false,
    error: null,
  });

  // Vérifier l'état de l'authentification au chargement
  useEffect(() => {
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        
        // Vérifier si le token est encore valide
        if (parsedAuth.accessToken && parsedAuth.expiryTime > Date.now()) {
          setAuthState({
            isAuthenticated: true,
            provider: parsedAuth.provider,
            userEmail: parsedAuth.userEmail,
            accessToken: parsedAuth.accessToken,
            loading: false,
          });
        } else {
          // Token expiré, nettoyer le stockage
          localStorage.removeItem("emailCleanerAuth");
        }
      } catch (error) {
        console.error("Erreur lors de la lecture des données d'authentification", error);
        localStorage.removeItem("emailCleanerAuth");
      }
    }
  }, []);

  // Gérer la redirection après l'authentification
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");
      
      if (error) {
        setAuthState((prev) => ({ ...prev, error, loading: false }));
        toast({
          title: "Échec de l'authentification",
          description: `Erreur: ${error}`,
          variant: "destructive",
        });
        return;
      }

      if (code) {
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setAuthState((prev) => ({ ...prev, loading: true }));
        
        try {
          // Dans un cas réel, on échangerait ce code contre un access token via une API backend
          // Pour cette démo, nous simulons une réponse réussie
          
          // Simulation d'obtention d'un token et des infos utilisateur
          setTimeout(() => {
            const mockUserEmail = "utilisateur@exemple.com";
            const mockToken = "mock_token_" + Math.random().toString(36).substring(2);
            
            const authData = {
              provider: "gmail" as const,
              userEmail: mockUserEmail,
              accessToken: mockToken,
              expiryTime: Date.now() + 3600 * 1000, // expire dans 1 heure
            };
            
            localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
            
            setAuthState({
              isAuthenticated: true,
              provider: "gmail",
              userEmail: mockUserEmail,
              accessToken: mockToken,
              loading: false,
            });
            
            toast({
              title: "Authentification réussie",
              description: `Connecté avec ${mockUserEmail}`,
            });
          }, 1500);
          
        } catch (error) {
          console.error("Erreur lors de l'échange du code d'autorisation", error);
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: "Échec de l'authentification. Veuillez réessayer.",
          }));
          toast({
            title: "Échec de l'authentification",
            description: "Une erreur est survenue lors de la connexion",
            variant: "destructive",
          });
        }
      }
    };
    
    handleAuthCallback();
  }, [toast]);

  // Se connecter avec Gmail
  const loginWithGmail = useCallback(() => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    
    // Pour une vraie implémentation, utilisez la bibliothèque auth2 de Google
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
      client_id=${GMAIL_CLIENT_ID}&
      redirect_uri=${encodeURIComponent(GMAIL_REDIRECT_URI)}&
      response_type=code&
      scope=${encodeURIComponent(GMAIL_SCOPES)}&
      access_type=offline&
      prompt=consent`.replace(/\s+/g, '');
    
    // Pour cette démo, nous simulons l'authentification avec un délai
    toast({
      title: "Simulation",
      description: "Dans un environnement réel, vous seriez redirigé vers la page d'authentification Google.",
    });
    
    setTimeout(() => {
      // Dans une véritable implémentation, on redirigerait vers authUrl
      // window.location.href = authUrl;
      
      // Pour cette démo, nous simulons une réponse réussie
      const mockUserEmail = "utilisateur@exemple.com";
      const mockToken = "mock_token_" + Math.random().toString(36).substring(2);
      
      const authData = {
        provider: "gmail" as const,
        userEmail: mockUserEmail,
        accessToken: mockToken,
        expiryTime: Date.now() + 3600 * 1000, // expire dans 1 heure
      };
      
      localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
      
      setAuthState({
        isAuthenticated: true,
        provider: "gmail",
        userEmail: mockUserEmail,
        accessToken: mockToken,
        loading: false,
      });
      
      toast({
        title: "Authentification simulée",
        description: `Connecté avec ${mockUserEmail}`,
      });
    }, 1500);
  }, [toast]);

  // Se déconnecter
  const logout = useCallback(() => {
    localStorage.removeItem("emailCleanerAuth");
    setAuthState({
      isAuthenticated: false,
      provider: null,
      userEmail: null,
      accessToken: null,
      loading: false,
    });
    toast({
      title: "Déconnexion réussie",
      description: "Vous êtes maintenant déconnecté",
    });
  }, [toast]);

  return {
    authState,
    loginWithGmail,
    logout,
  };
};

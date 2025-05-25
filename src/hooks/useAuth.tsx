import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AuthState } from "@/types";

// Client ID Gmail pour l'accès à l'API
const GMAIL_CLIENT_ID = "380256615541-t5q64hmeiamv9ae6detja5oofnn315t6.apps.googleusercontent.com";
const GMAIL_REDIRECT_URI = "https://carbon-footprint-cleaner-mails.lovable.app/auth/callback";

// Périmètres étendus pour Gmail
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
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
          console.log("Échange du code d'autorisation pour un token...");
          
          // Échanger le code contre un access token
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: GMAIL_CLIENT_ID,
              client_secret: '', // Pour les apps publiques, pas de secret
              code: code,
              grant_type: 'authorization_code',
              redirect_uri: GMAIL_REDIRECT_URI,
            }),
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange error:', errorData);
            throw new Error('Échec de l\'échange du code d\'autorisation');
          }

          const tokenData = await tokenResponse.json();
          console.log('Token reçu avec succès');

          // Récupérer les informations utilisateur
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
          });

          const userData = await userResponse.json();
          console.log('Données utilisateur récupérées:', userData);

          const authData = {
            provider: "gmail" as const,
            userEmail: userData.email,
            accessToken: tokenData.access_token,
            expiryTime: Date.now() + (tokenData.expires_in * 1000),
          };
          
          localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
          
          setAuthState({
            isAuthenticated: true,
            provider: "gmail",
            userEmail: userData.email,
            accessToken: tokenData.access_token,
            loading: false,
          });
          
          toast({
            title: "Authentification réussie",
            description: `Connecté avec ${userData.email}`,
          });
          
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
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GMAIL_CLIENT_ID}&redirect_uri=${encodeURIComponent(GMAIL_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(GMAIL_SCOPES)}&access_type=offline&prompt=consent`;
    
    toast({
      title: "Redirection vers Google",
      description: "Vous allez être redirigé vers la page d'authentification Google...",
    });
    
    // Redirection vers Google OAuth
    window.location.href = authUrl;
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

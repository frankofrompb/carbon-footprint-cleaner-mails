
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AuthState } from "@/types";

// Client ID Gmail pour l'accès à l'API
const GMAIL_CLIENT_ID = "380256615541-t5q64hmeiamv9ae6detja5oofnn315t6.apps.googleusercontent.com";

// Périmètres étendus pour Gmail
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
].join(" ");

// Déclaration globale pour Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}

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
    console.log("🔍 Vérification de l'authentification stockée...");
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        console.log("📱 Données d'auth trouvées:", { ...parsedAuth, accessToken: "***" });
        
        // Vérifier si le token est encore valide
        if (parsedAuth.accessToken && parsedAuth.expiryTime > Date.now()) {
          console.log("✅ Token encore valide");
          setAuthState({
            isAuthenticated: true,
            provider: parsedAuth.provider,
            userEmail: parsedAuth.userEmail,
            accessToken: parsedAuth.accessToken,
            loading: false,
            error: null,
          });
        } else {
          console.log("⏰ Token expiré, nettoyage...");
          localStorage.removeItem("emailCleanerAuth");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la lecture des données d'authentification", error);
        localStorage.removeItem("emailCleanerAuth");
      }
    } else {
      console.log("📱 Aucune donnée d'auth stockée");
    }
  }, []);

  // Charger la nouvelle Google Identity Services API
  useEffect(() => {
    const loadGoogleIdentityServices = () => {
      console.log("📦 Chargement de Google Identity Services...");
      
      // Charger le script Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        console.log("✅ Google Identity Services chargé");
        
        // Initialiser Google Identity Services
        if (window.google?.accounts?.oauth2) {
          console.log("🔐 Google OAuth2 disponible");
        }
      };
      script.onerror = () => {
        console.error("❌ Erreur de chargement de Google Identity Services");
      };
      document.head.appendChild(script);
    };

    if (!window.google?.accounts) {
      loadGoogleIdentityServices();
    }
  }, []);

  // Se connecter avec Gmail
  const loginWithGmail = useCallback(() => {
    console.log("🚀 Démarrage de la connexion Gmail...");
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    if (!window.google?.accounts?.oauth2) {
      console.error("❌ Google Identity Services non chargé");
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: "Google Identity Services non disponible. Veuillez rafraîchir la page."
      }));
      toast({
        title: "Erreur de connexion",
        description: "Google Identity Services non disponible. Veuillez rafraîchir la page.",
        variant: "destructive",
      });
      return;
    }

    console.log("🔐 Demande de connexion à Google...");

    try {
      // Créer un client OAuth2 avec la nouvelle API
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GMAIL_CLIENT_ID,
        scope: GMAIL_SCOPES,
        callback: (response: any) => {
          console.log("✅ Réponse OAuth2 reçue:", { ...response, access_token: "***" });
          
          if (response.access_token) {
            // Récupérer les informations utilisateur
            fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${response.access_token}`
              }
            })
            .then(res => res.json())
            .then(userInfo => {
              console.log("📋 Informations utilisateur reçues:", {
                email: userInfo.email,
                name: userInfo.name
              });
              
              const authData = {
                provider: "gmail" as const,
                userEmail: userInfo.email,
                accessToken: response.access_token,
                expiryTime: Date.now() + (response.expires_in * 1000),
              };
              
              localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
              
              setAuthState({
                isAuthenticated: true,
                provider: "gmail",
                userEmail: userInfo.email,
                accessToken: response.access_token,
                loading: false,
                error: null,
              });
              
              toast({
                title: "Authentification réussie",
                description: `Connecté avec ${userInfo.email}`,
              });
            })
            .catch(error => {
              console.error("❌ Erreur lors de la récupération des infos utilisateur:", error);
              setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: "Impossible de récupérer les informations utilisateur.",
              }));
              
              toast({
                title: "Erreur d'authentification",
                description: "Impossible de récupérer les informations utilisateur.",
                variant: "destructive",
              });
            });
          } else if (response.error) {
            console.error("❌ Erreur OAuth2:", response.error);
            
            let errorMessage = "Échec de l'authentification. Veuillez réessayer.";
            if (response.error === 'popup_closed_by_user') {
              errorMessage = "Connexion annulée par l'utilisateur.";
            } else if (response.error === 'access_denied') {
              errorMessage = "Accès refusé. Veuillez autoriser l'application.";
            }
            
            setAuthState((prev) => ({
              ...prev,
              loading: false,
              error: errorMessage,
            }));
            
            toast({
              title: "Échec de l'authentification",
              description: errorMessage,
              variant: "destructive",
            });
          }
        },
        error_callback: (error: any) => {
          console.error("❌ Erreur callback OAuth2:", error);
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: "Erreur lors de l'authentification.",
          }));
          
          toast({
            title: "Erreur d'authentification",
            description: "Erreur lors de l'authentification.",
            variant: "destructive",
          });
        }
      });

      // Demander le token
      client.requestAccessToken();
      
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation OAuth2:", error);
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: "Erreur lors de l'initialisation de l'authentification.",
      }));
      
      toast({
        title: "Erreur d'authentification",
        description: "Erreur lors de l'initialisation de l'authentification.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Se déconnecter
  const logout = useCallback(() => {
    console.log("🚪 Déconnexion...");
    
    // Révoquer le token si possible
    if (authState.accessToken && window.google?.accounts?.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(authState.accessToken, () => {
          console.log("✅ Token révoqué");
        });
      } catch (error) {
        console.warn("⚠️ Erreur lors de la révocation du token:", error);
      }
    }
    
    localStorage.removeItem("emailCleanerAuth");
    setAuthState({
      isAuthenticated: false,
      provider: null,
      userEmail: null,
      accessToken: null,
      loading: false,
      error: null,
    });
    toast({
      title: "Déconnexion réussie",
      description: "Vous êtes maintenant déconnecté",
    });
  }, [toast, authState.accessToken]);

  return {
    authState,
    loginWithGmail,
    logout,
  };
};

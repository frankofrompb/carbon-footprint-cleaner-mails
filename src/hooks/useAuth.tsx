
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

// Déclaration globale pour Google API
declare global {
  interface Window {
    google: any;
    gapi: any;
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

  // Charger l'API Google
  useEffect(() => {
    const loadGoogleAPI = () => {
      console.log("📦 Chargement de l'API Google...");
      
      // Charger le script Google API
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log("✅ API Google chargée");
        
        window.gapi.load('auth2', () => {
          console.log("🔐 Module auth2 chargé");
          
          window.gapi.auth2.init({
            client_id: GMAIL_CLIENT_ID,
            scope: GMAIL_SCOPES
          }).then(() => {
            console.log("✅ Google Auth2 initialisé");
          }).catch((error: any) => {
            console.error("❌ Erreur d'initialisation Google Auth2:", error);
          });
        });
      };
      script.onerror = () => {
        console.error("❌ Erreur de chargement de l'API Google");
      };
      document.head.appendChild(script);
    };

    if (!window.gapi) {
      loadGoogleAPI();
    }
  }, []);

  // Se connecter avec Gmail
  const loginWithGmail = useCallback(() => {
    console.log("🚀 Démarrage de la connexion Gmail...");
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    if (!window.gapi || !window.gapi.auth2) {
      console.error("❌ API Google non chargée");
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: "API Google non disponible. Veuillez rafraîchir la page."
      }));
      toast({
        title: "Erreur de connexion",
        description: "API Google non disponible. Veuillez rafraîchir la page.",
        variant: "destructive",
      });
      return;
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    
    if (!authInstance) {
      console.error("❌ Instance d'authentification non disponible");
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: "Service d'authentification non disponible."
      }));
      toast({
        title: "Erreur de connexion",
        description: "Service d'authentification non disponible.",
        variant: "destructive",
      });
      return;
    }

    console.log("🔐 Demande de connexion à Google...");
    
    authInstance.signIn({
      scope: GMAIL_SCOPES
    }).then((googleUser: any) => {
      console.log("✅ Connexion Google réussie");
      
      const authResponse = googleUser.getAuthResponse();
      const profile = googleUser.getBasicProfile();
      
      console.log("📋 Données utilisateur reçues:", {
        email: profile.getEmail(),
        name: profile.getName()
      });
      
      const authData = {
        provider: "gmail" as const,
        userEmail: profile.getEmail(),
        accessToken: authResponse.access_token,
        expiryTime: Date.now() + (authResponse.expires_in * 1000),
      };
      
      localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
      
      setAuthState({
        isAuthenticated: true,
        provider: "gmail",
        userEmail: profile.getEmail(),
        accessToken: authResponse.access_token,
        loading: false,
        error: null,
      });
      
      toast({
        title: "Authentification réussie",
        description: `Connecté avec ${profile.getEmail()}`,
      });
      
    }).catch((error: any) => {
      console.error("❌ Erreur de connexion Google:", error);
      
      let errorMessage = "Échec de l'authentification. Veuillez réessayer.";
      if (error.error === 'popup_closed_by_user') {
        errorMessage = "Connexion annulée par l'utilisateur.";
      } else if (error.error === 'access_denied') {
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
    });
  }, [toast]);

  // Se déconnecter
  const logout = useCallback(() => {
    console.log("🚪 Déconnexion...");
    
    // Déconnexion de Google si disponible
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.signOut().then(() => {
          console.log("✅ Déconnexion Google réussie");
        }).catch((error: any) => {
          console.warn("⚠️ Erreur lors de la déconnexion Google:", error);
        });
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
  }, [toast]);

  return {
    authState,
    loginWithGmail,
    logout,
  };
};

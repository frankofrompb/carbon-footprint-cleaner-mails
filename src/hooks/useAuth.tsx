
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

  // Gérer la redirection après l'authentification
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");
      const state = urlParams.get("state");
      
      console.log("🔗 Paramètres URL:", { code: code ? "présent" : "absent", error, state });
      
      if (error) {
        console.error("❌ Erreur OAuth reçue:", error);
        setAuthState((prev) => ({ ...prev, error, loading: false }));
        toast({
          title: "Échec de l'authentification",
          description: `Erreur: ${error}`,
          variant: "destructive",
        });
        return;
      }

      if (code) {
        console.log("🔑 Code d'autorisation reçu, démarrage de l'échange...");
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setAuthState((prev) => ({ ...prev, loading: true }));
        
        try {
          console.log("🔄 Échange du code d'autorisation pour un token...");
          
          // Échanger le code contre un access token
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: GMAIL_CLIENT_ID,
              code: code,
              grant_type: 'authorization_code',
              redirect_uri: GMAIL_REDIRECT_URI,
            }),
          });

          console.log("📊 Réponse token status:", tokenResponse.status);

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('❌ Erreur échange token:', errorData);
            throw new Error(`Échec de l'échange du code d'autorisation: ${tokenResponse.status}`);
          }

          const tokenData = await tokenResponse.json();
          console.log("✅ Token reçu avec succès, expires_in:", tokenData.expires_in);

          // Récupérer les informations utilisateur
          console.log("👤 Récupération des informations utilisateur...");
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
          });

          if (!userResponse.ok) {
            const errorData = await userResponse.text();
            console.error('❌ Erreur récupération utilisateur:', errorData);
            throw new Error(`Échec de la récupération des données utilisateur: ${userResponse.status}`);
          }

          const userData = await userResponse.json();
          console.log('✅ Données utilisateur récupérées:', { email: userData.email, name: userData.name });

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
            error: null,
          });
          
          toast({
            title: "Authentification réussie",
            description: `Connecté avec ${userData.email}`,
          });
          
        } catch (error) {
          console.error("❌ Erreur lors de l'échange du code d'autorisation", error);
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : "Échec de l'authentification. Veuillez réessayer.",
          }));
          toast({
            title: "Échec de l'authentification",
            description: error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion",
            variant: "destructive",
          });
        }
      }
    };
    
    handleAuthCallback();
  }, [toast]);

  // Se connecter avec Gmail
  const loginWithGmail = useCallback(() => {
    console.log("🚀 Démarrage de la connexion Gmail...");
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GMAIL_CLIENT_ID}&redirect_uri=${encodeURIComponent(GMAIL_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(GMAIL_SCOPES)}&access_type=offline&prompt=consent`;
    
    console.log("🔗 URL d'authentification:", authUrl);
    
    toast({
      title: "Redirection vers Google",
      description: "Vous allez être redirigé vers la page d'authentification Google...",
    });
    
    // Redirection vers Google OAuth
    window.location.href = authUrl;
  }, [toast]);

  // Se déconnecter
  const logout = useCallback(() => {
    console.log("🚪 Déconnexion...");
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

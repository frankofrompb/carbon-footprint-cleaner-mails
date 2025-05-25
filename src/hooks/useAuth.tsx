
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
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Vérifier les paramètres dans l'URL et le hash (flux implicite)
      const code = urlParams.get("code");
      const accessToken = hashParams.get("access_token") || urlParams.get("access_token");
      const expiresIn = hashParams.get("expires_in") || urlParams.get("expires_in");
      const error = urlParams.get("error") || hashParams.get("error");
      
      console.log("🔗 Paramètres URL:", { 
        code: code ? "présent" : "absent", 
        accessToken: accessToken ? "présent" : "absent",
        expiresIn,
        error 
      });
      
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

      // Si on a un access token directement (flux implicite)
      if (accessToken) {
        console.log("🔑 Access token reçu directement (flux implicite)");
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setAuthState((prev) => ({ ...prev, loading: true }));
        
        try {
          // Récupérer les informations utilisateur
          console.log("👤 Récupération des informations utilisateur...");
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
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
            accessToken: accessToken,
            expiryTime: Date.now() + (parseInt(expiresIn || "3600") * 1000),
          };
          
          localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
          
          setAuthState({
            isAuthenticated: true,
            provider: "gmail",
            userEmail: userData.email,
            accessToken: accessToken,
            loading: false,
            error: null,
          });
          
          toast({
            title: "Authentification réussie",
            description: `Connecté avec ${userData.email}`,
          });
          
        } catch (error) {
          console.error("❌ Erreur lors du traitement du token", error);
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
      // Si on a un code (flux d'autorisation), ne plus l'utiliser car il nécessite client_secret
      else if (code) {
        console.log("⚠️ Code d'autorisation reçu mais flux non supporté sans client_secret");
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: "Configuration OAuth incorrecte. Veuillez utiliser le flux implicite.",
        }));
        toast({
          title: "Échec de l'authentification",
          description: "Configuration OAuth incorrecte. Contactez l'administrateur.",
          variant: "destructive",
        });
      }
    };
    
    handleAuthCallback();
  }, [toast]);

  // Se connecter avec Gmail
  const loginWithGmail = useCallback(() => {
    console.log("🚀 Démarrage de la connexion Gmail...");
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    
    // Utiliser le flux implicite (response_type=token) au lieu du flux d'autorisation
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GMAIL_CLIENT_ID}&redirect_uri=${encodeURIComponent(GMAIL_REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(GMAIL_SCOPES)}&include_granted_scopes=true&state=state_parameter_passthrough_value`;
    
    console.log("🔗 URL d'authentification (flux implicite):", authUrl);
    
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

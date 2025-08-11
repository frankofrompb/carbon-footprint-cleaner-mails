
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface AuthState {
  isAuthenticated: boolean;
  provider?: 'gmail' | 'outlook' | null;
  userEmail: string | null;
  accessToken?: string | null;
  loading: boolean;
  error?: string | null;
}

export const useAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: null,
    loading: false,
  });
  const [googleClient, setGoogleClient] = useState<any>(null);

  useEffect(() => {
    console.log("🔍 Vérification de l'authentification stockée...");
    
    // Vérifier si l'utilisateur est déjà connecté
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        console.log("📱 Auth trouvée:", { email: parsedAuth.userEmail, hasToken: !!parsedAuth.accessToken });
        
        if (parsedAuth.userEmail && parsedAuth.accessToken) {
          setAuthState({
            isAuthenticated: true,
            userEmail: parsedAuth.userEmail,
            accessToken: parsedAuth.accessToken,
            loading: false,
          });
          console.log("✅ Utilisateur déjà connecté:", parsedAuth.userEmail);
        } else {
          console.log("⚠️ Auth incomplète, nettoyage...");
          localStorage.removeItem("emailCleanerAuth");
        }
      } catch (error) {
        console.error("❌ Erreur lors du parsing de l'auth:", error);
        localStorage.removeItem("emailCleanerAuth");
      }
    } else {
      console.log("📱 Aucune donnée d'auth stockée");
    }

    // Charger le script Google Identity Services
    loadGoogleIdentityServices();
  }, []);

  const loadGoogleIdentityServices = () => {
    console.log("📦 Chargement de Google Identity Services...");
    
    // Vérifier si déjà chargé
    if (window.google?.accounts?.oauth2) {
      console.log("✅ Google Identity Services déjà disponible");
      initializeGoogleAuth();
      return;
    }

    if (document.getElementById("google-identity-script")) {
      console.log("📦 Script déjà en cours de chargement...");
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅ Google Identity Services chargé avec succès");
      // Attendre un peu que tout soit initialisé
      setTimeout(() => {
        initializeGoogleAuth();
      }, 100);
    };
    
    script.onerror = () => {
      console.error("❌ Erreur lors du chargement de Google Identity Services");
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les services Google. Vérifiez votre connexion internet.",
        variant: "destructive",
      });
    };
    
    document.head.appendChild(script);
  };

  const initializeGoogleAuth = () => {
    console.log("🔐 Initialisation de Google OAuth2...");
    
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      console.log("✅ Google OAuth2 disponible, création du client...");
      
      try {
        console.log("🔗 URI de redirection sera l'origine courante:", window.location.origin);
        
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: "380256615541-t5q64hmeiamv9ae6detja5oofnn315t6.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
          callback: handleGoogleAuthSuccess
        });
        
        setGoogleClient(client);
        console.log("✅ Client Google OAuth2 initialisé avec succès");
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation du client OAuth2:", error);
        setAuthState(prev => ({ ...prev, loading: false }));
        toast({
          title: "Erreur d'initialisation",
          description: "Impossible d'initialiser l'authentification Google",
          variant: "destructive",
        });
      }
    } else {
      console.error("❌ Google Identity Services non disponible après chargement");
      toast({
        title: "Service indisponible",
        description: "Les services Google ne sont pas disponibles",
        variant: "destructive",
      });
    }
  };

  const handleGoogleAuthSuccess = (response: any) => {
    console.log("🎉 Callback d'authentification Google appelé:", {
      hasAccessToken: !!response.access_token,
      tokenLength: response.access_token?.length,
      scopes: response.scope,
      error: response.error
    });

    if (response.error) {
      console.error("❌ ERREUR GOOGLE AUTH:", response.error);
      toast({
        title: "Erreur d'authentification",
        description: `Erreur Google: ${response.error}`,
        variant: "destructive",
      });
      return;
    }

    if (response.access_token) {
      console.log("✅ TOKEN D'ACCÈS REÇU - LONGUEUR:", response.access_token.length);
      
      // Stocker le token et les données d'auth
      const authData = {
        accessToken: response.access_token,
        tokenType: response.token_type || 'Bearer',
        expiresIn: response.expires_in,
        scope: response.scope,
        timestamp: Date.now()
      };
      
      console.log("💾 SAUVEGARDE AUTH DATA:", {
        hasAccessToken: !!authData.accessToken,
        tokenLength: authData.accessToken.length,
        expiresIn: authData.expiresIn,
        timestamp: authData.timestamp
      });

      const authDataWithEmail = { ...authData, userEmail: '' }; // Sera mis à jour avec l'email réel
      localStorage.setItem("emailCleanerAuth", JSON.stringify(authDataWithEmail));

      // TEST IMMÉDIAT DU TOKEN
      console.log("🧪 TEST IMMÉDIAT DU TOKEN AVEC L'API GMAIL...");
      fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${response.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        console.log("📊 STATUS TEST TOKEN:", response.status);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Status: ${response.status}`);
        }
      })
      .then(profileData => {
        console.log("✅ TOKEN VALIDE - PROFIL:", profileData.emailAddress);
        // Mettre à jour avec l'email réel
        const finalAuthData = { ...authData, userEmail: profileData.emailAddress };
        localStorage.setItem("emailCleanerAuth", JSON.stringify(finalAuthData));
        
        setAuthState({
          isAuthenticated: true,
          provider: 'gmail',
          userEmail: profileData.emailAddress,
          accessToken: response.access_token,
          loading: false,
          error: null,
        });
        
        toast({
          title: "Connexion réussie",
          description: `Connecté à Gmail : ${profileData.emailAddress}`,
        });
      })
      .catch(error => {
        console.error("❌ ÉCHEC TEST TOKEN:", error);
        toast({
          title: "Token invalide",
          description: "Le token d'accès Gmail n'est pas valide",
          variant: "destructive",
        });
      });
    } else {
      console.error("❌ Aucun access_token dans la réponse");
      toast({
        title: "Erreur d'authentification",
        description: "Aucun token d'accès reçu de Google",
        variant: "destructive",
      });
    }
  };

  const loginWithGmail = () => {
    console.log("🚀 Tentative de connexion Gmail...");
    if (googleClient) {
      console.log("✅ Client disponible, demande du token...");
      setAuthState(prev => ({ ...prev, loading: true }));
      googleClient.requestAccessToken();
    } else {
      console.error("❌ Client Google non initialisé");
      toast({
        title: "Client non disponible",
        description: "Le client d'authentification Google n'est pas prêt",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    console.log("👋 Déconnexion...");
    localStorage.removeItem("emailCleanerAuth");
    setAuthState({
      isAuthenticated: false,
      userEmail: null,
      loading: false,
    });
    toast({
      title: "Déconnexion",
      description: "Vous êtes maintenant déconnecté",
    });
  };

  return {
    authState,
    loginWithGmail,
    logout,
  };
};

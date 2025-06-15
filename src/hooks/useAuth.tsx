
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface AuthState {
  userEmail: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
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
            userEmail: parsedAuth.userEmail,
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
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: "380256615541-t5q64hmeiamv9ae6detja5oofnn315t6.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
          callback: handleGoogleAuthSuccess,
        });
        
        setGoogleClient(client);
        console.log("✅ Client Google OAuth2 initialisé avec succès");
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation du client OAuth2:", error);
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
    console.log("🎉 Réponse d'authentification Google:", {
      hasAccessToken: !!response.access_token,
      tokenLength: response.access_token?.length,
      error: response.error
    });

    if (response.error) {
      console.error("❌ Erreur dans la réponse Google:", response.error);
      setAuthState(prev => ({ ...prev, loading: false }));
      
      if (response.error === 'popup_closed_by_user') {
        toast({
          title: "Connexion annulée",
          description: "La fenêtre de connexion a été fermée",
        });
      } else {
        toast({
          title: "Erreur d'authentification",
          description: `Erreur Google: ${response.error}`,
          variant: "destructive",
        });
      }
      return;
    }

    if (response.access_token) {
      console.log("🔑 Token d'accès reçu, récupération du profil...");
      
      // Récupérer les informations du profil utilisateur
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${response.access_token}`,
        },
      })
        .then((res) => {
          console.log("📊 Réponse profil utilisateur:", res.status);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then((userInfo) => {
          console.log("👤 Informations utilisateur récupérées:", {
            email: userInfo.email,
            name: userInfo.name
          });
          
          // Sauvegarder les données d'authentification
          const authData = {
            userEmail: userInfo.email,
            accessToken: response.access_token,
            userInfo: userInfo,
            timestamp: Date.now()
          };
          
          localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
          
          setAuthState({
            userEmail: userInfo.email,
            loading: false,
          });

          toast({
            title: "Connexion réussie !",
            description: `Connecté en tant que ${userInfo.email}`,
          });

          console.log("✅ Authentification terminée avec succès");
        })
        .catch((error) => {
          console.error("❌ Erreur lors de la récupération du profil:", error);
          setAuthState({ userEmail: null, loading: false });
          
          toast({
            title: "Erreur de connexion",
            description: "Impossible de récupérer les informations du profil",
            variant: "destructive",
          });
        });
    } else {
      console.error("❌ Aucun token d'accès reçu");
      setAuthState({ userEmail: null, loading: false });
      
      toast({
        title: "Erreur d'authentification",
        description: "Aucun token d'accès reçu de Google",
        variant: "destructive",
      });
    }
  };

  const loginWithGmail = () => {
    console.log("🚀 Début du processus d'authentification Gmail...");
    
    if (!googleClient) {
      console.error("❌ Client Google non initialisé");
      toast({
        title: "Service non prêt",
        description: "Les services d'authentification ne sont pas encore prêts. Veuillez réessayer dans quelques secondes.",
        variant: "destructive",
      });
      
      // Réessayer d'initialiser
      setTimeout(() => {
        initializeGoogleAuth();
      }, 1000);
      return;
    }
    
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      console.log("🔑 Déclenchement du popup d'authentification Google");
      googleClient.requestAccessToken();
      console.log("📱 Popup d'authentification demandé");
    } catch (error) {
      console.error("❌ Erreur lors du déclenchement de l'auth:", error);
      setAuthState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erreur de connexion",
        description: "Impossible de démarrer l'authentification Google",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    console.log("👋 Déconnexion de l'utilisateur");
    
    localStorage.removeItem("emailCleanerAuth");
    setAuthState({
      userEmail: null,
      loading: false,
    });

    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  return {
    authState,
    loginWithGmail,
    logout,
  };
};

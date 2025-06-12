
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
    
    if (document.getElementById("google-identity-script")) {
      console.log("✅ Script déjà chargé");
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅ Google Identity Services chargé");
      initializeGoogleAuth();
    };
    
    script.onerror = () => {
      console.error("❌ Erreur lors du chargement de Google Identity Services");
    };
    
    document.head.appendChild(script);
  };

  const initializeGoogleAuth = () => {
    if (typeof window !== 'undefined' && window.google) {
      console.log("🔐 Google OAuth2 disponible");
      
      window.google.accounts.oauth2.initTokenClient({
        client_id: "1082053717769-lfgcgj7e5vfnlfq7r6qv4rj0m8d3k5l0.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
        callback: handleGoogleAuthSuccess,
      });
    } else {
      console.error("❌ Google Identity Services non disponible");
    }
  };

  const handleGoogleAuthSuccess = (response: any) => {
    console.log("🎉 Réponse d'authentification Google reçue:", {
      hasAccessToken: !!response.access_token,
      tokenLength: response.access_token?.length
    });

    if (response.access_token) {
      setAuthState({ userEmail: null, loading: true });
      
      // Récupérer les informations du profil utilisateur
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${response.access_token}`,
        },
      })
        .then((res) => {
          console.log("📊 Réponse profil utilisateur:", res.status);
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
    
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      console.log("🔑 Déclenchement du popup d'authentification Google");
      
      setAuthState(prev => ({ ...prev, loading: true }));
      
      try {
        // Déclencher le popup d'authentification
        window.google.accounts.oauth2.initTokenClient({
          client_id: "1082053717769-lfgcgj7e5vfnlfq7r6qv4rj0m8d3k5l0.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
          callback: handleGoogleAuthSuccess,
        }).requestAccessToken();
        
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
    } else {
      console.error("❌ Google OAuth2 non disponible");
      
      toast({
        title: "Service indisponible",
        description: "Les services d'authentification Google ne sont pas encore chargés. Veuillez réessayer dans quelques secondes.",
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

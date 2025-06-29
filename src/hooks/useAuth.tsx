
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AuthState, GoogleAuthResponse } from "@/types/auth";
import { GoogleOAuthClient } from "@/utils/googleOAuth";
import { authStorage } from "@/utils/authStorage";
import { fetchGoogleUserInfo, validateAuthorizedEmail } from "@/utils/googleUserInfo";

export const useAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    userEmail: null,
    loading: false,
  });
  const [googleClient, setGoogleClient] = useState<GoogleOAuthClient | null>(null);
  const [isGoogleClientReady, setIsGoogleClientReady] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const storedAuth = authStorage.load();
    if (storedAuth) {
      setAuthState({
        userEmail: storedAuth.userEmail,
        loading: false,
      });
    }

    // Initialiser le client Google OAuth
    const client = new GoogleOAuthClient(handleGoogleAuthSuccess);
    setGoogleClient(client);

    // Écouter l'événement de disponibilité du client Google
    const handleGoogleClientReady = () => {
      console.log("🎉 DEBUG - Client Google prêt, activation du bouton");
      setIsGoogleClientReady(true);
    };

    window.addEventListener('googleClientReady', handleGoogleClientReady);

    // Vérifier périodiquement si le client est prêt (fallback)
    const checkClientReady = setInterval(() => {
      if (client && client.isReady()) {
        console.log("🔄 DEBUG - Client prêt détecté par vérification périodique");
        setIsGoogleClientReady(true);
        clearInterval(checkClientReady);
      }
    }, 500);

    // Nettoyer après 10 secondes
    setTimeout(() => {
      clearInterval(checkClientReady);
      if (client && client.isReady()) {
        setIsGoogleClientReady(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('googleClientReady', handleGoogleClientReady);
      clearInterval(checkClientReady);
    };
  }, []);

  const handleGoogleAuthSuccess = (response: GoogleAuthResponse) => {
    console.log("🎉 DEBUG - Réponse d'authentification Google:", response);

    if (response.error) {
      console.error("❌ DEBUG - Erreur dans la réponse Google:", response.error);
      setAuthState(prev => ({ ...prev, loading: false }));
      
      if (response.error === 'popup_closed_by_user') {
        toast({
          title: "Connexion annulée",
          description: "La fenêtre de connexion a été fermée",
        });
      } else if (response.error === 'access_denied') {
        toast({
          title: "Accès refusé",
          description: "L'autorisation d'accès à Gmail a été refusée",
          variant: "destructive",
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
      console.log("🔑 DEBUG - Token d'accès reçu, récupération du profil...");
      
      fetchGoogleUserInfo(response.access_token)
        .then((userInfo) => {
          validateAuthorizedEmail(userInfo.email);
          
          const authData = {
            userEmail: userInfo.email,
            accessToken: response.access_token!,
            userInfo: userInfo,
            timestamp: Date.now()
          };
          
          authStorage.save(authData);
          
          setAuthState({
            userEmail: userInfo.email,
            loading: false,
          });

          toast({
            title: "Connexion réussie !",
            description: `Connecté en tant que ${userInfo.email}`,
          });

          console.log("✅ DEBUG - Authentification terminée avec succès");
        })
        .catch((error) => {
          console.error("❌ DEBUG - Erreur lors de la récupération du profil:", error);
          setAuthState({ userEmail: null, loading: false });
          
          toast({
            title: "Erreur de connexion",
            description: error.message || "Impossible de récupérer les informations du profil",
            variant: "destructive",
          });
        });
    } else {
      console.error("❌ DEBUG - Aucun token d'accès reçu");
      setAuthState({ userEmail: null, loading: false });
      
      toast({
        title: "Erreur d'authentification",
        description: "Aucun token d'accès reçu de Google",
        variant: "destructive",
      });
    }
  };

  const loginWithGmail = () => {
    console.log("🚀 DEBUG - Tentative de connexion Gmail...");
    console.log("🔍 DEBUG - État:", { 
      hasClient: !!googleClient, 
      isReady: isGoogleClientReady,
      clientReady: googleClient?.isReady() 
    });

    if (!googleClient) {
      console.error("❌ DEBUG - Pas de client Google");
      toast({
        title: "Service non disponible",
        description: "Les services d'authentification ne sont pas disponibles",
        variant: "destructive",
      });
      return;
    }
    
    if (!isGoogleClientReady || !googleClient.isReady()) {
      console.warn("⚠️ DEBUG - Client pas encore prêt");
      toast({
        title: "Service en cours de chargement",
        description: "Les services d'authentification se chargent, veuillez réessayer dans quelques secondes",
      });
      return;
    }
    
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      console.log("🔓 DEBUG - Lancement de l'authentification Google");
      googleClient.requestAccessToken();
    } catch (error) {
      console.error("❌ DEBUG - Erreur lors du lancement:", error);
      setAuthState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erreur de connexion",
        description: `Impossible de démarrer l'authentification: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    console.log("👋 DEBUG - Déconnexion");
    
    authStorage.clear();
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
    authState: {
      ...authState,
      loading: authState.loading || !isGoogleClientReady
    },
    loginWithGmail,
    logout,
  };
};

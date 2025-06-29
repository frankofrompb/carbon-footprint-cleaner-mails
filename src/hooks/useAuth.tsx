
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
  }, []);

  const handleGoogleAuthSuccess = (response: GoogleAuthResponse) => {
    console.log("🎉 DEBUG - Réponse d'authentification Google complète:", response);
    console.log("🎉 DEBUG - Type de réponse:", typeof response);
    console.log("🎉 DEBUG - Clés de la réponse:", Object.keys(response || {}));

    if (response.error) {
      console.error("❌ DEBUG - Erreur dans la réponse Google:", response.error);
      console.error("❌ DEBUG - Détails de l'erreur:", response.error_description);
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
          description: `Erreur Google: ${response.error} - ${response.error_description || 'Détails non disponibles'}`,
          variant: "destructive",
        });
      }
      return;
    }

    if (response.access_token) {
      console.log("🔑 DEBUG - Token d'accès reçu:");
      console.log("  - Longueur du token:", response.access_token.length);
      console.log("  - Type du token:", typeof response.access_token);
      console.log("  - Premiers caractères:", response.access_token.substring(0, 20) + "...");
      
      // Récupérer les informations du profil utilisateur
      fetchGoogleUserInfo(response.access_token)
        .then((userInfo) => {
          // Vérifier si l'email est autorisé
          validateAuthorizedEmail(userInfo.email);
          
          // Sauvegarder les données d'authentification
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

          console.log("✅ DEBUG - Authentification terminée avec succès pour:", userInfo.email);
        })
        .catch((error) => {
          console.error("❌ DEBUG - Erreur lors de la récupération du profil:", error);
          console.error("❌ DEBUG - Stack trace:", error.stack);
          setAuthState({ userEmail: null, loading: false });
          
          toast({
            title: "Erreur de connexion",
            description: error.message || "Impossible de récupérer les informations du profil",
            variant: "destructive",
          });
        });
    } else {
      console.error("❌ DEBUG - Aucun token d'accès reçu");
      console.log("🔍 DEBUG - Contenu de la réponse sans token:", response);
      setAuthState({ userEmail: null, loading: false });
      
      toast({
        title: "Erreur d'authentification",
        description: "Aucun token d'accès reçu de Google",
        variant: "destructive",
      });
    }
  };

  const loginWithGmail = () => {
    if (!googleClient) {
      toast({
        title: "Service non prêt",
        description: "Les services d'authentification ne sont pas encore prêts. Veuillez réessayer dans quelques secondes.",
        variant: "destructive",
      });
      
      // Réessayer d'initialiser
      setTimeout(() => {
        console.log("🔄 DEBUG - Tentative de réinitialisation...");
        const client = new GoogleOAuthClient(handleGoogleAuthSuccess);
        setGoogleClient(client);
      }, 1000);
      return;
    }
    
    if (!googleClient.isReady()) {
      toast({
        title: "Service non prêt",
        description: "Les services d'authentification ne sont pas encore prêts. Veuillez réessayer dans quelques secondes.",
        variant: "destructive",
      });
      return;
    }
    
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      googleClient.requestAccessToken();
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: "Erreur de connexion",
        description: `Impossible de démarrer l'authentification Google: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    console.log("👋 DEBUG - Déconnexion de l'utilisateur");
    
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
    authState,
    loginWithGmail,
    logout,
  };
};

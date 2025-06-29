
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
    console.log("🔍 DEBUG - Vérification de l'authentification stockée...");
    
    // Vérifier si l'utilisateur est déjà connecté
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        console.log("📱 DEBUG - Auth trouvée:", { 
          email: parsedAuth.userEmail, 
          hasToken: !!parsedAuth.accessToken,
          timestamp: parsedAuth.timestamp ? new Date(parsedAuth.timestamp).toISOString() : 'N/A'
        });
        
        if (parsedAuth.userEmail && parsedAuth.accessToken) {
          setAuthState({
            userEmail: parsedAuth.userEmail,
            loading: false,
          });
          console.log("✅ DEBUG - Utilisateur déjà connecté:", parsedAuth.userEmail);
        } else {
          console.log("⚠️ DEBUG - Auth incomplète, nettoyage...");
          localStorage.removeItem("emailCleanerAuth");
        }
      } catch (error) {
        console.error("❌ DEBUG - Erreur lors du parsing de l'auth:", error);
        localStorage.removeItem("emailCleanerAuth");
      }
    } else {
      console.log("📱 DEBUG - Aucune donnée d'auth stockée");
    }

    // Charger le script Google Identity Services
    loadGoogleIdentityServices();
  }, []);

  const loadGoogleIdentityServices = () => {
    console.log("📦 DEBUG - Chargement de Google Identity Services...");
    
    // Vérifier si déjà chargé
    if (window.google?.accounts?.oauth2) {
      console.log("✅ DEBUG - Google Identity Services déjà disponible");
      initializeGoogleAuth();
      return;
    }

    if (document.getElementById("google-identity-script")) {
      console.log("📦 DEBUG - Script déjà en cours de chargement...");
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅ DEBUG - Google Identity Services chargé avec succès");
      // Attendre un peu que tout soit initialisé
      setTimeout(() => {
        initializeGoogleAuth();
      }, 100);
    };
    
    script.onerror = () => {
      console.error("❌ DEBUG - Erreur lors du chargement de Google Identity Services");
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les services Google. Vérifiez votre connexion internet.",
        variant: "destructive",
      });
    };
    
    document.head.appendChild(script);
  };

  const initializeGoogleAuth = () => {
    console.log("🔐 DEBUG - Initialisation de Google OAuth2...");
    console.log("🌐 DEBUG - URL actuelle:", window.location.href);
    console.log("🌐 DEBUG - Origin actuel:", window.location.origin);
    
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      console.log("✅ DEBUG - Google OAuth2 disponible, création du client...");
      
      try {
        const clientConfig = {
          client_id: "380256615541-t5q64hmeiamv9ae6detja5oofnn315t6.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
          callback: handleGoogleAuthSuccess,
        };
        
        console.log("🔧 DEBUG - Configuration du client OAuth:", {
          client_id: clientConfig.client_id,
          scope: clientConfig.scope,
          hasCallback: !!clientConfig.callback
        });
        
        const client = window.google.accounts.oauth2.initTokenClient(clientConfig);
        
        setGoogleClient(client);
        console.log("✅ DEBUG - Client Google OAuth2 initialisé avec succès");
        console.log("🔑 DEBUG - Type du client:", typeof client);
        console.log("🔑 DEBUG - Propriétés du client:", Object.getOwnPropertyNames(client));
        console.log("🔑 DEBUG - Méthodes disponibles:", Object.keys(client || {}));
      } catch (error) {
        console.error("❌ DEBUG - Erreur lors de l'initialisation du client OAuth2:", error);
        console.error("❌ DEBUG - Stack trace:", error.stack);
        toast({
          title: "Erreur d'initialisation",
          description: `Impossible d'initialiser l'authentification Google: ${error.message}`,
          variant: "destructive",
        });
      }
    } else {
      console.error("❌ DEBUG - Google Identity Services non disponible après chargement");
      console.log("🔍 DEBUG - window.google:", window.google);
      console.log("🔍 DEBUG - window.google?.accounts:", window.google?.accounts);
      console.log("🔍 DEBUG - window.google?.accounts?.oauth2:", window.google?.accounts?.oauth2);
      toast({
        title: "Service indisponible",
        description: "Les services Google ne sont pas disponibles",
        variant: "destructive",
      });
    }
  };

  const handleGoogleAuthSuccess = (response: any) => {
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
      console.log("👤 DEBUG - Récupération du profil utilisateur...");
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${response.access_token}`,
        },
      })
        .then((res) => {
          console.log("📊 DEBUG - Réponse profil utilisateur:", {
            status: res.status,
            statusText: res.statusText,
            ok: res.ok,
            headers: Object.fromEntries(res.headers.entries())
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then((userInfo) => {
          console.log("👤 DEBUG - Informations utilisateur récupérées:", {
            email: userInfo.email,
            name: userInfo.name,
            id: userInfo.id,
            verified_email: userInfo.verified_email
          });
          
          // Vérifier si l'email est autorisé
          const authorizedEmail = "francois.louart@gmail.com";
          if (userInfo.email !== authorizedEmail) {
            console.warn("⚠️ DEBUG - Email non autorisé:", userInfo.email);
            throw new Error(`Email non autorisé. Seul ${authorizedEmail} peut se connecter en mode test.`);
          }
          
          // Sauvegarder les données d'authentification
          const authData = {
            userEmail: userInfo.email,
            accessToken: response.access_token,
            userInfo: userInfo,
            timestamp: Date.now()
          };
          
          console.log("💾 DEBUG - Sauvegarde des données d'auth:", {
            email: authData.userEmail,
            hasToken: !!authData.accessToken,
            timestamp: new Date(authData.timestamp).toISOString()
          });
          
          localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
          
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
    console.log("🚀 DEBUG - Début du processus d'authentification Gmail...");
    console.log("🔍 DEBUG - État du client Google:", {
      hasClient: !!googleClient,
      clientType: typeof googleClient,
      clientKeys: googleClient ? Object.keys(googleClient) : [],
      clientProps: googleClient ? Object.getOwnPropertyNames(googleClient) : []
    });
    
    if (!googleClient) {
      console.error("❌ DEBUG - Client Google non initialisé");
      toast({
        title: "Service non prêt",
        description: "Les services d'authentification ne sont pas encore prêts. Veuillez réessayer dans quelques secondes.",
        variant: "destructive",
      });
      
      // Réessayer d'initialiser
      setTimeout(() => {
        console.log("🔄 DEBUG - Tentative de réinitialisation...");
        initializeGoogleAuth();
      }, 1000);
      return;
    }
    
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      console.log("🔑 DEBUG - Tentative d'appel de requestAccessToken...");
      
      // Essayer différentes méthodes possibles
      if (typeof googleClient.requestAccessToken === 'function') {
        console.log("✅ DEBUG - Utilisation de requestAccessToken()");
        googleClient.requestAccessToken();
      } else if (typeof googleClient.l === 'function') {
        console.log("✅ DEBUG - Utilisation de l() - version minifiée");
        googleClient.l();
      } else {
        console.log("🔍 DEBUG - Recherche d'autres méthodes disponibles...");
        const methods = Object.getOwnPropertyNames(googleClient).filter(prop => 
          typeof googleClient[prop] === 'function'
        );
        console.log("🔍 DEBUG - Méthodes disponibles:", methods);
        
        // Essayer la première méthode qui ressemble à une fonction de requête
        const requestMethod = methods.find(method => 
          method.includes('request') || method.includes('Request') || method === 'l'
        );
        
        if (requestMethod) {
          console.log(`✅ DEBUG - Utilisation de ${requestMethod}()`);
          googleClient[requestMethod]();
        } else {
          throw new Error("Aucune méthode de requête trouvée sur le client Google");
        }
      }
      
      console.log("📱 DEBUG - Popup d'authentification demandé avec succès");
    } catch (error) {
      console.error("❌ DEBUG - Erreur lors du déclenchement de l'auth:", error);
      console.error("❌ DEBUG - Stack trace:", error.stack);
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

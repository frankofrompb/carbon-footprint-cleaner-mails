
import { GoogleAuthResponse } from "@/types/auth";

export class GoogleOAuthClient {
  private client: any = null;
  private callback: (response: GoogleAuthResponse) => void;

  constructor(callback: (response: GoogleAuthResponse) => void) {
    this.callback = callback;
    this.loadGoogleIdentityServices();
  }

  private loadGoogleIdentityServices() {
    console.log("📦 DEBUG - Chargement de Google Identity Services...");
    
    if (window.google?.accounts?.oauth2) {
      console.log("✅ DEBUG - Google Identity Services déjà disponible");
      this.initializeGoogleAuth();
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
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100);
    };
    
    script.onerror = () => {
      console.error("❌ DEBUG - Erreur lors du chargement de Google Identity Services");
    };
    
    document.head.appendChild(script);
  }

  private initializeGoogleAuth() {
    console.log("🔐 DEBUG - Initialisation de Google OAuth2...");
    console.log("🌐 DEBUG - URL actuelle:", window.location.href);
    console.log("🌐 DEBUG - Origin actuel:", window.location.origin);
    
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      console.log("✅ DEBUG - Google OAuth2 disponible, création du client...");
      
      try {
        const clientConfig = {
          client_id: "380256615541-t5q64hmeiamv9ae6detja5oofnn315t6.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
          callback: this.callback,
        };
        
        console.log("🔧 DEBUG - Configuration du client OAuth:", {
          client_id: clientConfig.client_id,
          scope: clientConfig.scope,
          hasCallback: !!clientConfig.callback
        });
        
        this.client = window.google.accounts.oauth2.initTokenClient(clientConfig);
        
        console.log("✅ DEBUG - Client Google OAuth2 initialisé avec succès");
        console.log("🔑 DEBUG - Type du client:", typeof this.client);
        console.log("🔑 DEBUG - Propriétés du client:", Object.getOwnPropertyNames(this.client));
        console.log("🔑 DEBUG - Méthodes disponibles:", Object.keys(this.client || {}));
      } catch (error) {
        console.error("❌ DEBUG - Erreur lors de l'initialisation du client OAuth2:", error);
        console.error("❌ DEBUG - Stack trace:", error.stack);
      }
    } else {
      console.error("❌ DEBUG - Google Identity Services non disponible après chargement");
      console.log("🔍 DEBUG - window.google:", window.google);
      console.log("🔍 DEBUG - window.google?.accounts:", window.google?.accounts);
      console.log("🔍 DEBUG - window.google?.accounts?.oauth2:", window.google?.accounts?.oauth2);
    }
  }

  public requestAccessToken() {
    console.log("🚀 DEBUG - Début du processus d'authentification Gmail...");
    console.log("🔍 DEBUG - État du client Google:", {
      hasClient: !!this.client,
      clientType: typeof this.client,
      clientKeys: this.client ? Object.keys(this.client) : [],
      clientProps: this.client ? Object.getOwnPropertyNames(this.client) : []
    });
    
    if (!this.client) {
      console.error("❌ DEBUG - Client Google non initialisé");
      throw new Error("Client Google non initialisé");
    }
    
    try {
      console.log("🔑 DEBUG - Tentative d'appel de requestAccessToken...");
      
      // Essayer différentes méthodes possibles
      if (typeof this.client.requestAccessToken === 'function') {
        console.log("✅ DEBUG - Utilisation de requestAccessToken()");
        this.client.requestAccessToken();
      } else if (typeof this.client.l === 'function') {
        console.log("✅ DEBUG - Utilisation de l() - version minifiée");
        this.client.l();
      } else {
        console.log("🔍 DEBUG - Recherche d'autres méthodes disponibles...");
        const methods = Object.getOwnPropertyNames(this.client).filter(prop => 
          typeof this.client[prop] === 'function'
        );
        console.log("🔍 DEBUG - Méthodes disponibles:", methods);
        
        // Essayer la première méthode qui ressemble à une fonction de requête
        const requestMethod = methods.find(method => 
          method.includes('request') || method.includes('Request') || method === 'l'
        );
        
        if (requestMethod) {
          console.log(`✅ DEBUG - Utilisation de ${requestMethod}()`);
          this.client[requestMethod]();
        } else {
          throw new Error("Aucune méthode de requête trouvée sur le client Google");
        }
      }
      
      console.log("📱 DEBUG - Popup d'authentification demandé avec succès");
    } catch (error) {
      console.error("❌ DEBUG - Erreur lors du déclenchement de l'auth:", error);
      console.error("❌ DEBUG - Stack trace:", error.stack);
      throw error;
    }
  }

  public isReady(): boolean {
    return !!this.client;
  }
}

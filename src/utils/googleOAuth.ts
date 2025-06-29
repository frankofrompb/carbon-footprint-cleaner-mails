
import { GoogleAuthResponse } from "@/types/auth";

export class GoogleOAuthClient {
  private client: any = null;
  private callback: (response: GoogleAuthResponse) => void;
  private isClientReady = false;

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
    
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      console.log("✅ DEBUG - Google OAuth2 disponible, création du client...");
      
      try {
        const clientConfig = {
          client_id: "380256615541-t5q64hmeiamv9ae6detja5oofnn315t6.apps.googleusercontent.com",
          scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile", 
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.modify"
          ].join(" "),
          callback: this.callback,
        };
        
        console.log("🔧 DEBUG - Configuration du client OAuth:", {
          client_id: clientConfig.client_id,
          scope: clientConfig.scope,
          hasCallback: !!clientConfig.callback
        });
        
        this.client = window.google.accounts.oauth2.initTokenClient(clientConfig);
        this.isClientReady = true;
        
        console.log("✅ DEBUG - Client Google OAuth2 initialisé avec succès");
        console.log("🔑 DEBUG - Type du client:", typeof this.client);
        console.log("🔑 DEBUG - Propriétés du client:", Object.getOwnPropertyNames(this.client));
        
        // Déclencher un événement pour notifier que le client est prêt
        window.dispatchEvent(new CustomEvent('googleClientReady'));
        
      } catch (error) {
        console.error("❌ DEBUG - Erreur lors de l'initialisation du client OAuth2:", error);
        this.isClientReady = false;
      }
    } else {
      console.error("❌ DEBUG - Google Identity Services non disponible après chargement");
      this.isClientReady = false;
    }
  }

  public requestAccessToken() {
    console.log("🚀 DEBUG - Début du processus d'authentification Gmail...");
    console.log("🔍 DEBUG - État du client Google:", {
      hasClient: !!this.client,
      isReady: this.isClientReady,
      clientType: typeof this.client
    });
    
    if (!this.client || !this.isClientReady) {
      console.error("❌ DEBUG - Client Google non prêt");
      throw new Error("Client Google non initialisé ou non prêt");
    }
    
    try {
      console.log("🔑 DEBUG - Tentative d'appel de la méthode d'authentification...");
      
      // D'après les logs, la méthode s'appelle 'l' dans la version minifiée
      if (typeof this.client.l === 'function') {
        console.log("✅ DEBUG - Utilisation de l() - version minifiée");
        this.client.l();
      } else if (typeof this.client.requestAccessToken === 'function') {
        console.log("✅ DEBUG - Utilisation de requestAccessToken()");
        this.client.requestAccessToken();
      } else {
        console.log("🔍 DEBUG - Recherche d'autres méthodes disponibles...");
        const methods = Object.getOwnPropertyNames(this.client).filter(prop => 
          typeof this.client[prop] === 'function'
        );
        console.log("🔍 DEBUG - Méthodes disponibles:", methods);
        
        // Essayer une autre méthode disponible
        if (methods.length > 0) {
          const method = methods[0]; // Prendre la première méthode disponible
          console.log(`✅ DEBUG - Utilisation de ${method}()`);
          this.client[method]();
        } else {
          throw new Error("Aucune méthode d'authentification trouvée sur le client Google");
        }
      }
      
      console.log("📱 DEBUG - Popup d'authentification demandé avec succès");
    } catch (error) {
      console.error("❌ DEBUG - Erreur lors du déclenchement de l'auth:", error);
      throw error;
    }
  }

  public isReady(): boolean {
    return this.isClientReady && !!this.client;
  }
}

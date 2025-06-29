
import { AuthData } from "@/types/auth";

export const authStorage = {
  save: (authData: AuthData) => {
    console.log("💾 DEBUG - Sauvegarde des données d'auth:", {
      email: authData.userEmail,
      hasToken: !!authData.accessToken,
      timestamp: new Date(authData.timestamp).toISOString()
    });
    
    localStorage.setItem("emailCleanerAuth", JSON.stringify(authData));
  },

  load: (): AuthData | null => {
    console.log("🔍 DEBUG - Vérification de l'authentification stockée...");
    
    const storedAuth = localStorage.getItem("emailCleanerAuth");
    if (!storedAuth) {
      console.log("📱 DEBUG - Aucune donnée d'auth stockée");
      return null;
    }

    try {
      const parsedAuth = JSON.parse(storedAuth);
      console.log("📱 DEBUG - Auth trouvée:", { 
        email: parsedAuth.userEmail, 
        hasToken: !!parsedAuth.accessToken,
        timestamp: parsedAuth.timestamp ? new Date(parsedAuth.timestamp).toISOString() : 'N/A'
      });
      
      if (parsedAuth.userEmail && parsedAuth.accessToken) {
        console.log("✅ DEBUG - Utilisateur déjà connecté:", parsedAuth.userEmail);
        return parsedAuth;
      } else {
        console.log("⚠️ DEBUG - Auth incomplète, nettoyage...");
        authStorage.clear();
        return null;
      }
    } catch (error) {
      console.error("❌ DEBUG - Erreur lors du parsing de l'auth:", error);
      authStorage.clear();
      return null;
    }
  },

  clear: () => {
    console.log("👋 DEBUG - Nettoyage des données d'auth");
    localStorage.removeItem("emailCleanerAuth");
  }
};

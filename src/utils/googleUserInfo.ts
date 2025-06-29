
import { GoogleUserInfo } from "@/types/auth";

export const fetchGoogleUserInfo = async (accessToken: string): Promise<GoogleUserInfo> => {
  console.log("👤 DEBUG - Début récupération du profil utilisateur...");
  console.log("🔑 DEBUG - Token pour profil - longueur:", accessToken.length);
  console.log("🔑 DEBUG - Token pour profil - début:", accessToken.substring(0, 20) + "...");
  
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("📊 DEBUG - RÉPONSE DÉTAILLÉE profil utilisateur:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ DEBUG - Erreur HTTP lors de la récupération du profil:");
      console.error("❌ DEBUG - Status:", response.status, response.statusText);
      console.error("❌ DEBUG - Response body:", errorText);
      console.error("❌ DEBUG - Headers:", Object.fromEntries(response.headers.entries()));
      
      if (response.status === 401) {
        console.error("🚨 DEBUG - ERREUR 401: Token d'accès invalide ou expiré");
        console.error("🚨 DEBUG - Vérifiez les scopes OAuth et la validité du token");
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const userInfo = await response.json();
    console.log("👤 DEBUG - Informations utilisateur récupérées:", {
      email: userInfo.email,
      name: userInfo.name,
      id: userInfo.id,
      verified_email: userInfo.verified_email
    });

    return userInfo;
  } catch (error) {
    console.error("❌ DEBUG - Exception lors de fetchGoogleUserInfo:", error);
    throw error;
  }
};

export const validateAuthorizedEmail = (email: string): void => {
  const authorizedEmail = "francois.louart@gmail.com";
  console.log("🔍 DEBUG - Validation email:", { received: email, authorized: authorizedEmail });
  
  if (email !== authorizedEmail) {
    console.warn("⚠️ DEBUG - Email non autorisé:", email);
    throw new Error(`Email non autorisé. Seul ${authorizedEmail} peut se connecter en mode test.`);
  }
  
  console.log("✅ DEBUG - Email autorisé validé");
};

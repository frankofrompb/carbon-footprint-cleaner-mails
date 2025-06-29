
import { GoogleUserInfo } from "@/types/auth";

export const fetchGoogleUserInfo = async (accessToken: string): Promise<GoogleUserInfo> => {
  console.log("👤 DEBUG - Récupération du profil utilisateur...");
  
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log("📊 DEBUG - Réponse profil utilisateur:", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const userInfo = await response.json();
  console.log("👤 DEBUG - Informations utilisateur récupérées:", {
    email: userInfo.email,
    name: userInfo.name,
    id: userInfo.id,
    verified_email: userInfo.verified_email
  });

  return userInfo;
};

export const validateAuthorizedEmail = (email: string): void => {
  const authorizedEmail = "francois.louart@gmail.com";
  if (email !== authorizedEmail) {
    console.warn("⚠️ DEBUG - Email non autorisé:", email);
    throw new Error(`Email non autorisé. Seul ${authorizedEmail} peut se connecter en mode test.`);
  }
};

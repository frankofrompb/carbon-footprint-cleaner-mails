
import { GoogleUserInfo } from "@/types/auth";

export const fetchGoogleUserInfo = async (accessToken: string): Promise<GoogleUserInfo> => {
  console.log("👤 DEBUG - Début récupération du profil utilisateur...");
  console.log("🔑 DEBUG - Token pour profil - longueur:", accessToken.length);
  console.log("🔑 DEBUG - Token pour profil - début:", accessToken.substring(0, 20) + "...");
  
  try {
    // Essayer d'abord l'API userinfo v1 (plus permissive)
    let response = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log("📊 DEBUG - RÉPONSE API v1:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    // Si v1 échoue, essayer v2
    if (!response.ok) {
      console.log("⚠️ DEBUG - API v1 échoué, essai avec v2...");
      response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log("📊 DEBUG - RÉPONSE API v2:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ DEBUG - Erreur HTTP lors de la récupération du profil:");
      console.error("❌ DEBUG - Status:", response.status, response.statusText);
      console.error("❌ DEBUG - Response body:", errorText);
      console.error("❌ DEBUG - Headers envoyés:", {
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
      });
      
      if (response.status === 401) {
        console.error("🚨 DEBUG - ERREUR 401: Token d'accès invalide ou expiré");
        console.error("🚨 DEBUG - Vérifiez les scopes OAuth et la validité du token");
        console.error("🚨 DEBUG - Token reçu:", accessToken.substring(0, 50) + "...");
        
        // Essayer une approche alternative avec l'API People
        console.log("🔄 DEBUG - Tentative avec l'API People...");
        const peopleResponse = await fetch("https://people.googleapis.com/v1/people/me?personFields=emailAddresses,names", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (peopleResponse.ok) {
          const peopleData = await peopleResponse.json();
          console.log("✅ DEBUG - Données People API récupérées:", peopleData);
          
          // Transformer les données People API au format attendu
          const userInfo = {
            email: peopleData.emailAddresses?.[0]?.value || '',
            name: peopleData.names?.[0]?.displayName || '',
            id: peopleData.resourceName?.replace('people/', '') || '',
            verified_email: true
          };
          
          console.log("👤 DEBUG - Profil utilisateur transformé:", userInfo);
          return userInfo;
        }
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

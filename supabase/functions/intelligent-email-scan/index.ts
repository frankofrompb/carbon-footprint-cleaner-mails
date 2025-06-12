
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  size?: number;
  snippet?: string;
  isUnread: boolean;
  daysSinceReceived: number;
  classification: {
    category: string;
    confidence: number;
    suggestedAction: string;
    reasoning: string;
  };
}

interface ScanResults {
  totalEmails: number;
  totalSizeMB: number;
  carbonFootprint: number;
  emails: EmailData[];
  summary: {
    oldUnreadEmails: number;
    promotionalEmails: number;
    socialEmails: number;
    notificationEmails: number;
    spamEmails: number;
    autoClassifiableEmails: number;
    duplicateSenderEmails: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken } = await req.json();
    
    if (!accessToken) {
      console.error('❌ AUCUN TOKEN D\'ACCÈS FOURNI');
      throw new Error('Access token is required');
    }

    console.log('🔍 DÉMARRAGE DU SCAN INTELLIGENT RÉEL - VÉRIFICATION DE L\'AUTHENTIFICATION');
    console.log('📧 Token reçu (longueur):', accessToken.length, 'caractères');
    console.log('📧 Token reçu (premiers caractères):', accessToken.substring(0, 30) + '...');

    // ÉTAPE 1: Vérifier l'authentification en récupérant le profil utilisateur
    console.log('🔐 TENTATIVE DE CONNEXION À L\'API GMAIL...');
    console.log('🔗 URL de vérification: https://gmail.googleapis.com/gmail/v1/users/me/profile');
    
    const profileResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 STATUS DE LA RÉPONSE PROFIL:', profileResponse.status);
    console.log('📊 HEADERS DE LA RÉPONSE:', Object.fromEntries(profileResponse.headers.entries()));

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('❌ ERREUR D\'AUTHENTIFICATION GMAIL:');
      console.error('❌ Status:', profileResponse.status);
      console.error('❌ Error text:', errorText);
      console.error('❌ Token utilisé:', accessToken.substring(0, 30) + '...');
      throw new Error(`Erreur d'authentification Gmail: ${profileResponse.status} - ${errorText}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ PROFIL UTILISATEUR RÉCUPÉRÉ AVEC SUCCÈS:');
    console.log('📧 Email de l\'utilisateur:', profileData.emailAddress);
    console.log('📊 Total emails dans la boîte:', profileData.messagesTotal);
    console.log('📂 Total threads:', profileData.threadsTotal);
    console.log('📈 Historique ID:', profileData.historyId);

    if (!profileData.emailAddress) {
      console.error('❌ AUCUN EMAIL D\'UTILISATEUR DANS LE PROFIL');
      throw new Error('Impossible de récupérer l\'email utilisateur');
    }

    // ÉTAPE 2: Commencer le scan des emails RÉELS
    console.log('🚀 DÉMARRAGE DU SCAN INTELLIGENT RÉEL POUR:', profileData.emailAddress);
    console.log('🎯 OBJECTIF: Scanner TOUS les emails de', profileData.emailAddress);

    // Limiter à 1000 emails pour le test initial
    const MAX_EMAILS = 1000;
    let allMessageIds: string[] = [];
    let nextPageToken: string | undefined;
    let pageCount = 0;

    console.log('📡 RÉCUPÉRATION DES IDS D\'EMAILS...');

    do {
      pageCount++;
      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      console.log(`📡 PAGE ${pageCount} - Requête vers Gmail API:`, searchUrl.replace(accessToken, '[TOKEN_MASQUÉ]'));
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 PAGE ${pageCount} - Status réponse:`, searchResponse.status);

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error(`❌ PAGE ${pageCount} - Erreur Gmail API search:`, errorText);
        console.error(`❌ PAGE ${pageCount} - Status:`, searchResponse.status);
        throw new Error(`Erreur lors de la recherche des emails: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      console.log(`📊 PAGE ${pageCount} - Données reçues:`, {
        messagesCount: searchData.messages?.length || 0,
        hasNextPageToken: !!searchData.nextPageToken,
        resultSizeEstimate: searchData.resultSizeEstimate
      });
      
      if (searchData.messages) {
        const newIds = searchData.messages.map((msg: any) => msg.id);
        allMessageIds.push(...newIds);
        console.log(`📨 PAGE ${pageCount} - Ajouté ${newIds.length} nouveaux IDs d'emails`);
        console.log(`📨 PAGE ${pageCount} - Exemples d'IDs:`, newIds.slice(0, 3));
      } else {
        console.log(`📨 PAGE ${pageCount} - Aucun message dans cette page`);
      }
      
      nextPageToken = searchData.nextPageToken;
      
      console.log(`📊 TOTAL IDs récupérés jusqu'à présent: ${allMessageIds.length}`);
      
      // Arrêter à MAX_EMAILS emails max pour éviter les timeouts
      if (allMessageIds.length >= MAX_EMAILS) {
        allMessageIds = allMessageIds.slice(0, MAX_EMAILS);
        console.log(`⚠️ Limite de ${MAX_EMAILS} emails atteinte, arrêt du scan`);
        break;
      }
      
    } while (nextPageToken && pageCount < 10); // Limiter à 10 pages max pour le debug

    console.log(`🎯 SCAN CONFIGURÉ POUR ${allMessageIds.length} emails de ${profileData.emailAddress}`);
    console.log(`📊 RÉCUPÉRATION TERMINÉE après ${pageCount} pages`);

    if (allMessageIds.length === 0) {
      console.error('❌ AUCUN EMAIL TROUVÉ - PROBLÈME POTENTIEL');
      console.error('❌ Vérifiez les permissions Gmail');
      throw new Error('Aucun email trouvé dans la boîte Gmail');
    }

    console.log(`📧 PREMIERS IDs d'emails récupérés:`, allMessageIds.slice(0, 5));

    // Traiter un échantillon d'emails pour vérification
    const sampleSize = Math.min(50, allMessageIds.length);
    const sampleIds = allMessageIds.slice(0, sampleSize);
    console.log(`🧪 TRAITEMENT D'UN ÉCHANTILLON DE ${sampleSize} emails pour vérification`);

    const allEmails: EmailData[] = [];

    for (let i = 0; i < sampleIds.length; i++) {
      const messageId = sampleIds[i];
      
      try {
        console.log(`📧 Traitement email ${i + 1}/${sampleSize} - ID: ${messageId}`);
        
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (messageResponse.ok) {
          const messageData = await messageResponse.json();
          const headers = messageData.payload?.headers || [];
          
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Sans sujet';
          const from = headers.find((h: any) => h.name === 'From')?.value || 'Expéditeur inconnu';
          const dateHeader = headers.find((h: any) => h.name === 'Date')?.value;
          
          // Log des premiers emails pour vérification
          if (i < 5) {
            console.log(`📧 EMAIL RÉEL ${i + 1}:`);
            console.log(`   ID: ${messageId}`);
            console.log(`   De: ${from}`);
            console.log(`   Sujet: ${subject}`);
            console.log(`   Date: ${dateHeader}`);
            console.log(`   Size: ${messageData.sizeEstimate} bytes`);
          }
          
          // Récupérer le snippet
          const snippet = messageData.snippet || '';
          
          // Vérifier si l'email est non lu
          const isUnread = messageData.labelIds?.includes('UNREAD') || false;
          
          // Calculer les jours depuis réception
          let emailDate: Date;
          let daysSinceReceived: number;
          
          try {
            emailDate = dateHeader ? new Date(dateHeader) : new Date();
            if (isNaN(emailDate.getTime())) {
              console.warn(`⚠️ Date invalide pour l'email ${messageId}: ${dateHeader}`);
              emailDate = new Date();
            }
            daysSinceReceived = Math.floor((Date.now() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
          } catch (error) {
            console.error(`❌ Erreur lors du traitement de la date pour l'email ${messageId}:`, error);
            emailDate = new Date();
            daysSinceReceived = 0;
          }
          
          // Classification de l'email
          const classification = classifyEmail(subject, from, snippet, isUnread, daysSinceReceived);
          
          const sizeInKb = Math.round((messageData.sizeEstimate || 10000) / 1024);

          allEmails.push({
            id: messageId,
            subject: subject.length > 100 ? subject.substring(0, 100) + '...' : subject,
            from: from.includes('<') ? from.split('<')[0].trim() : from,
            date: emailDate.toISOString(),
            size: sizeInKb,
            snippet: snippet.substring(0, 200),
            isUnread,
            daysSinceReceived,
            classification,
          });
        } else {
          console.error(`❌ Erreur lors de la récupération de l'email ${messageId}:`, messageResponse.status);
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de l'email ${messageId}:`, error);
      }
      
      // Pause entre les requêtes
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ EMAILS TRAITÉS: ${allEmails.length}/${sampleSize}`);
    console.log(`📊 ÉCHANTILLON D'EMAILS RÉELS RÉCUPÉRÉS:`, allEmails.slice(0, 3).map(e => ({
      subject: e.subject,
      from: e.from,
      date: e.date
    })));

    // Trier par date (plus récents en premier)
    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculer les statistiques sur l'échantillon
    const summary = {
      oldUnreadEmails: allEmails.filter(e => e.classification.category === 'old_unread').length,
      promotionalEmails: allEmails.filter(e => e.classification.category === 'promotional').length,
      socialEmails: allEmails.filter(e => e.classification.category === 'social').length,
      notificationEmails: allEmails.filter(e => e.classification.category === 'notification').length,
      spamEmails: allEmails.filter(e => e.classification.category === 'spam').length,
      autoClassifiableEmails: allEmails.filter(e => e.classification.category !== 'other' && e.classification.category !== 'duplicate_sender').length,
      duplicateSenderEmails: allEmails.filter(e => e.classification.category === 'duplicate_sender').length,
    };

    const totalSize = allEmails.reduce((sum, email) => sum + (email.size || 0), 0);
    const totalSizeMB = totalSize / 1024;
    const carbonFootprint = allEmails.length * 10;

    const results: ScanResults = {
      totalEmails: allMessageIds.length, // Total réel trouvé
      totalSizeMB,
      carbonFootprint: allMessageIds.length * 10, // Calcul sur le total réel
      emails: allEmails, // Échantillon traité
      summary,
    };

    console.log(`✅ SCAN INTELLIGENT TERMINÉ POUR ${profileData.emailAddress}:`);
    console.log(`   📧 ${allMessageIds.length} emails trouvés au total`);
    console.log(`   🧪 ${allEmails.length} emails traités dans l'échantillon`);
    console.log(`   📊 Résumé:`, summary);
    console.log(`   🎯 CONFIRMATION: Ce sont bien les emails RÉELS de ${profileData.emailAddress}`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 ERREUR MAJEURE dans le scan intelligent:', error);
    console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Check the function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function classifyEmail(subject: string, from: string, snippet: string, isUnread: boolean, daysSinceReceived: number) {
  const subjectLower = subject.toLowerCase();
  const fromLower = from.toLowerCase();
  const snippetLower = snippet.toLowerCase();
  
  // 1. Emails non lus anciens (>6 mois)
  if (isUnread && daysSinceReceived > 180) {
    return {
      category: 'old_unread',
      confidence: 0.95,
      suggestedAction: 'delete',
      reasoning: `Email non lu depuis ${daysSinceReceived} jours`
    };
  }
  
  // 2. Emails promotionnels
  const promoKeywords = ['unsubscribe', 'promotion', 'sale', 'discount', 'offer', 'deal', 'marketing', 'promo', 'newsletter'];
  if (promoKeywords.some(keyword => subjectLower.includes(keyword) || fromLower.includes(keyword) || snippetLower.includes(keyword))) {
    return {
      category: 'promotional',
      confidence: 0.8,
      suggestedAction: 'archive',
      reasoning: 'Contenu promotionnel détecté'
    };
  }
  
  // 3. Réseaux sociaux
  const socialSenders = ['facebook', 'twitter', 'linkedin', 'instagram', 'tiktok', 'youtube'];
  if (socialSenders.some(social => fromLower.includes(social))) {
    return {
      category: 'social',
      confidence: 0.9,
      suggestedAction: 'archive',
      reasoning: 'Notification de réseau social'
    };
  }
  
  // 4. Notifications
  const notificationKeywords = ['notification', 'alert', 'reminder', 'update'];
  if (notificationKeywords.some(keyword => subjectLower.includes(keyword))) {
    return {
      category: 'notification',
      confidence: 0.7,
      suggestedAction: 'archive',
      reasoning: 'Email de notification'
    };
  }
  
  // 5. Spam potentiel
  const spamKeywords = ['urgent', 'winner', 'lottery', 'click here', 'free money'];
  if (spamKeywords.some(keyword => subjectLower.includes(keyword) || snippetLower.includes(keyword))) {
    return {
      category: 'spam',
      confidence: 0.8,
      suggestedAction: 'delete',
      reasoning: 'Contenu suspect détecté'
    };
  }
  
  // 6. Autres catégories par défaut
  return {
    category: 'other',
    confidence: 0.5,
    suggestedAction: 'review',
    reasoning: 'Classification manuelle requise'
  };
}

serve(handler);

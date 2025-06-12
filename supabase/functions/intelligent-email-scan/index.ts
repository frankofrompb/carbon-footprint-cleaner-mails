
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
      throw new Error('Access token is required');
    }

    console.log('🔍 DÉMARRAGE DU SCAN INTELLIGENT - VÉRIFICATION DE L\'AUTHENTIFICATION');
    console.log('📧 Token reçu (premiers caractères):', accessToken.substring(0, 20) + '...');

    // ÉTAPE 1: Vérifier l'authentification en récupérant le profil utilisateur
    console.log('🔐 Vérification du profil utilisateur Gmail...');
    const profileResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('❌ ERREUR D\'AUTHENTIFICATION:', errorText);
      throw new Error(`Erreur d'authentification Gmail: ${profileText}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ PROFIL UTILISATEUR RÉCUPÉRÉ:');
    console.log('📧 Email:', profileData.emailAddress);
    console.log('📊 Total emails dans la boîte:', profileData.messagesTotal);
    console.log('📂 Total threads:', profileData.threadsTotal);

    // ÉTAPE 2: Commencer le scan des emails
    console.log('🚀 Démarrage du scan intelligent pour:', profileData.emailAddress);

    // Limiter à 5000 emails maximum pour éviter les timeouts
    const MAX_EMAILS = 5000;
    let allMessageIds: string[] = [];
    let nextPageToken: string | undefined;

    do {
      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      console.log('📡 Requête vers Gmail API:', searchUrl.replace(accessToken, '[TOKEN_MASQUÉ]'));
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('❌ Erreur Gmail API search:', errorText);
        throw new Error('Erreur lors de la recherche des emails');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.messages) {
        allMessageIds.push(...searchData.messages.map((msg: any) => msg.id));
        console.log(`📨 Récupéré ${searchData.messages.length} nouveaux IDs d'emails`);
      }
      
      nextPageToken = searchData.nextPageToken;
      
      console.log(`📊 Total IDs récupérés: ${allMessageIds.length}`);
      
      // Arrêter à 5000 emails max
      if (allMessageIds.length >= MAX_EMAILS) {
        allMessageIds = allMessageIds.slice(0, MAX_EMAILS);
        console.log(`⚠️ Limite de ${MAX_EMAILS} emails atteinte, arrêt du scan`);
        break;
      }
      
    } while (nextPageToken);

    console.log(`🎯 SCAN CONFIGURÉ POUR ${allMessageIds.length} emails de ${profileData.emailAddress}`);

    // Traiter les emails par plus petits batches (25 au lieu de 50)
    const allEmails: EmailData[] = [];
    const batchSize = 25;
    const totalBatches = Math.ceil(allMessageIds.length / batchSize);

    for (let i = 0; i < allMessageIds.length; i += batchSize) {
      const batch = allMessageIds.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`🔄 Traitement du lot ${batchNumber}/${totalBatches} (emails ${i + 1} à ${Math.min(i + batchSize, allMessageIds.length)})`);
      
      const batchPromises = batch.map(async (messageId) => {
        try {
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
            if (allEmails.length < 3) {
              console.log(`📧 EMAIL ${allEmails.length + 1}:`);
              console.log(`   De: ${from}`);
              console.log(`   Sujet: ${subject}`);
              console.log(`   Date: ${dateHeader}`);
            }
            
            // Récupérer le snippet via une requête séparée plus légère
            const snippet = messageData.snippet || '';
            
            // Vérifier si l'email est non lu
            const isUnread = messageData.labelIds?.includes('UNREAD') || false;
            
            // Calculer les jours depuis réception avec une gestion d'erreur améliorée
            let emailDate: Date;
            let daysSinceReceived: number;
            
            try {
              emailDate = dateHeader ? new Date(dateHeader) : new Date();
              // Vérifier si la date est valide
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

            return {
              id: messageId,
              subject: subject.length > 100 ? subject.substring(0, 100) + '...' : subject,
              from: from.includes('<') ? from.split('<')[0].trim() : from,
              date: emailDate.toISOString(),
              size: sizeInKb,
              snippet: snippet.substring(0, 200),
              isUnread,
              daysSinceReceived,
              classification,
            };
          }
        } catch (error) {
          console.error(`❌ Erreur lors du traitement de l'email ${messageId}:`, error);
        }
        return null;
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter((email): email is EmailData => email !== null);
      allEmails.push(...validResults);
      
      // Pause plus longue entre les batches pour réduire la charge CPU
      if (i + batchSize < allMessageIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Analyser les expéditeurs pour identifier ceux avec >1 email
    const senderCounts = new Map<string, number>();
    allEmails.forEach(email => {
      const sender = email.from.toLowerCase();
      senderCounts.set(sender, (senderCounts.get(sender) || 0) + 1);
    });

    // Reclassifier les emails selon les expéditeurs multiples
    allEmails.forEach(email => {
      const sender = email.from.toLowerCase();
      const count = senderCounts.get(sender) || 0;
      
      // Si l'expéditeur a plus d'1 email et que l'email n'est pas déjà dans une catégorie prioritaire
      if (count > 1 && email.classification.category === 'other') {
        email.classification = {
          category: 'duplicate_sender',
          confidence: 0.9,
          suggestedAction: 'group',
          reasoning: `Expéditeur avec ${count} emails`
        };
      }
    });

    // Trier par date (plus récents en premier)
    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculer les statistiques
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
      totalEmails: allEmails.length,
      totalSizeMB,
      carbonFootprint,
      emails: allEmails,
      summary,
    };

    console.log(`✅ SCAN TERMINÉ POUR ${profileData.emailAddress}:`);
    console.log(`   📧 ${results.totalEmails} emails analysés`);
    console.log(`   📊 Résumé:`, summary);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 ERREUR MAJEURE dans le scan intelligent:', error);
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

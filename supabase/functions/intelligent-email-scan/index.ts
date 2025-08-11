
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

    console.log('🔍 DÉMARRAGE DU SCAN INTELLIGENT RÉEL');
    console.log('📧 Token reçu (longueur):', accessToken.length, 'caractères');

    // ÉTAPE 1: Vérifier l'authentification
    console.log('🔐 TENTATIVE DE CONNEXION À L\'API GMAIL...');
    
    const profileResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 STATUS DE LA RÉPONSE PROFIL:', profileResponse.status);

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('❌ ERREUR D\'AUTHENTIFICATION GMAIL:', errorText);
      throw new Error(`Erreur d'authentification Gmail: ${profileResponse.status} - ${errorText}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ PROFIL UTILISATEUR RÉCUPÉRÉ:');
    console.log('📧 Email:', profileData.emailAddress);
    console.log('📊 Total emails:', profileData.messagesTotal);

    // ÉTAPE 2: Récupérer les IDs des emails
    console.log('📡 RÉCUPÉRATION DES IDS D\'EMAILS...');
    
    const searchResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ Erreur Gmail API search:', errorText);
      throw new Error(`Erreur lors de la recherche des emails: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('📊 Emails trouvés:', searchData.messages?.length || 0);
    
    if (!searchData.messages || searchData.messages.length === 0) {
      console.log('⚠️ Aucun email trouvé');
      return new Response(JSON.stringify({
        totalEmails: 0,
        totalSizeMB: 0,
        carbonFootprint: 0,
        emails: [],
        summary: {
          oldUnreadEmails: 0,
          promotionalEmails: 0,
          socialEmails: 0,
          notificationEmails: 0,
          spamEmails: 0,
          autoClassifiableEmails: 0,
          duplicateSenderEmails: 0,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const messageIds = searchData.messages.map((msg: any) => msg.id);
    console.log('📧 IDs récupérés:', messageIds.length);

    // ÉTAPE 3: Traiter les emails réels
    const allEmails: EmailData[] = [];
    const maxEmailsToProcess = Math.min(50, messageIds.length);

    console.log(`🧪 TRAITEMENT DE ${maxEmailsToProcess} emails réels`);

    for (let i = 0; i < maxEmailsToProcess; i++) {
      const messageId = messageIds[i];
      
      try {
        console.log(`📧 Traitement email ${i + 1}/${maxEmailsToProcess} - ID: ${messageId}`);
        
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
          
          console.log(`   De: ${from}`);
          console.log(`   Sujet: ${subject.substring(0, 50)}...`);
          
          const snippet = messageData.snippet || '';
          const isUnread = messageData.labelIds?.includes('UNREAD') || false;
          
          let emailDate: Date;
          let daysSinceReceived: number;
          
          try {
            emailDate = dateHeader ? new Date(dateHeader) : new Date();
            if (isNaN(emailDate.getTime())) {
              emailDate = new Date();
            }
            daysSinceReceived = Math.floor((Date.now() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
          } catch (error) {
            emailDate = new Date();
            daysSinceReceived = 0;
          }
          
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
        }
      } catch (error) {
        console.error(`❌ Erreur email ${messageId}:`, error);
      }
    }

    console.log(`✅ ${allEmails.length} EMAILS RÉELS TRAITÉS`);

    // Trier par date (plus récents en premier)
    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculer les statistiques réelles
    const summary = {
      oldUnreadEmails: allEmails.filter(e => e.classification.category === 'old_unread').length,
      promotionalEmails: allEmails.filter(e => e.classification.category === 'promotional').length,
      socialEmails: allEmails.filter(e => e.classification.category === 'social').length,
      notificationEmails: allEmails.filter(e => e.classification.category === 'notification').length,
      spamEmails: allEmails.filter(e => e.classification.category === 'spam').length,
      autoClassifiableEmails: allEmails.filter(e => e.classification.category !== 'other').length,
      duplicateSenderEmails: 0, // Calcul plus complexe à implémenter si nécessaire
    };

    const totalSize = allEmails.reduce((sum, email) => sum + (email.size || 0), 0);
    const totalSizeMB = totalSize / 1024;

    const totalCount = typeof profileData?.messagesTotal === 'number'
      ? profileData.messagesTotal
      : (searchData.resultSizeEstimate || messageIds.length);

    const results: ScanResults = {
      totalEmails: totalCount,
      totalSizeMB,
      carbonFootprint: totalCount * 10,
      emails: allEmails,
      summary,
    };

    console.log(`✅ SCAN INTELLIGENT TERMINÉ:`);
    console.log(`   📧 ${results.totalEmails} emails au total`);
    console.log(`   🧪 ${allEmails.length} emails traités`);
    console.log(`   📊 Résumé:`, summary);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 ERREUR:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
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
  
  // 1. Emails non lus anciens (>6 mois = 180 jours)
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
  
  // 6. Autres
  return {
    category: 'other',
    confidence: 0.5,
    suggestedAction: 'review',
    reasoning: 'Classification manuelle requise'
  };
}

serve(handler);

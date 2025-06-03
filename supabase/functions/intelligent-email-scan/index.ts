
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      throw new Error('Token d\'accès manquant');
    }

    console.log('Démarrage du scan intelligent des emails...');

    // Récupérer tous les emails avec pagination
    let allMessageIds: string[] = [];
    let nextPageToken: string | undefined;

    do {
      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!searchResponse.ok) {
        throw new Error('Erreur lors de la recherche des emails');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.messages) {
        allMessageIds.push(...searchData.messages.map((msg: any) => msg.id));
      }
      
      nextPageToken = searchData.nextPageToken;
      
      // Limiter à 2000 emails pour éviter les timeouts
      if (allMessageIds.length >= 2000) {
        break;
      }
      
    } while (nextPageToken);

    console.log(`Analyse de ${allMessageIds.length} emails...`);

    const allEmails: EmailData[] = [];
    const batchSize = 50;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (let i = 0; i < allMessageIds.length; i += batchSize) {
      const batch = allMessageIds.slice(i, i + batchSize);
      console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(allMessageIds.length / batchSize)}`);
      
      const batchPromises = batch.map(async (messageId) => {
        try {
          const messageResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
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
            
            const emailDate = dateHeader ? new Date(dateHeader) : new Date();
            const daysSinceReceived = Math.floor((Date.now() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
            
            const isUnread = messageData.labelIds?.includes('UNREAD') || false;
            const sizeInKb = Math.round((messageData.sizeEstimate || 10000) / 1024);
            
            // Extraire le snippet/contenu pour classification
            const snippet = messageData.snippet || '';
            
            // Classification intelligente
            const classification = classifyEmail(subject, from, snippet, isUnread, daysSinceReceived);

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
          console.error(`Erreur lors du traitement de l'email ${messageId}:`, error);
        }
        return null;
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter((email): email is EmailData => email !== null);
      allEmails.push(...validResults);
      
      // Pause entre les lots
      if (i + batchSize < allMessageIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Calculer les statistiques
    const summary = {
      oldUnreadEmails: allEmails.filter(e => e.isUnread && e.daysSinceReceived > 180).length,
      promotionalEmails: allEmails.filter(e => e.classification.category === 'promotional').length,
      socialEmails: allEmails.filter(e => e.classification.category === 'social').length,
      notificationEmails: allEmails.filter(e => e.classification.category === 'notification').length,
      spamEmails: allEmails.filter(e => e.classification.category === 'spam').length,
      autoClassifiableEmails: allEmails.filter(e => 
        ['order_confirmation', 'travel', 'invoice', 'newsletter'].includes(e.classification.category)
      ).length,
    };

    const totalSize = allEmails.reduce((sum, email) => sum + (email.size || 0), 0);
    const totalSizeMB = totalSize / 1024;
    const carbonFootprint = allEmails.length * 10;

    const results: ScanResults = {
      totalEmails: allEmails.length,
      totalSizeMB,
      carbonFootprint,
      emails: allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      summary,
    };

    console.log('Scan intelligent terminé:', summary);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans le scan intelligent:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: 'Vérifiez les logs de la fonction pour plus d\'informations'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function classifyEmail(subject: string, from: string, snippet: string, isUnread: boolean, daysSinceReceived: number) {
  const subjectLower = subject.toLowerCase();
  const fromLower = from.toLowerCase();
  const snippetLower = snippet.toLowerCase();
  
  // Règles de classification basées sur des mots-clés et patterns
  
  // Emails non lus depuis plus de 6 mois
  if (isUnread && daysSinceReceived > 180) {
    return {
      category: 'old_unread',
      confidence: 0.95,
      suggestedAction: 'delete',
      reasoning: 'Email non lu depuis plus de 6 mois'
    };
  }
  
  // Confirmations de commande
  if (subjectLower.includes('commande') || subjectLower.includes('confirmation') || 
      subjectLower.includes('reçu') || subjectLower.includes('facture') || 
      subjectLower.includes('order') || subjectLower.includes('receipt')) {
    return {
      category: 'order_confirmation',
      confidence: 0.85,
      suggestedAction: 'organize',
      reasoning: 'Confirmation de commande détectée'
    };
  }
  
  // Emails de voyage
  if (subjectLower.includes('vol') || subjectLower.includes('réservation') || 
      subjectLower.includes('hôtel') || subjectLower.includes('booking') || 
      subjectLower.includes('flight') || subjectLower.includes('travel')) {
    return {
      category: 'travel',
      confidence: 0.85,
      suggestedAction: 'organize',
      reasoning: 'Email de voyage détecté'
    };
  }
  
  // Promotions et marketing
  if (subjectLower.includes('promotion') || subjectLower.includes('offre') || 
      subjectLower.includes('soldes') || subjectLower.includes('réduction') || 
      subjectLower.includes('discount') || subjectLower.includes('sale') ||
      snippetLower.includes('unsubscribe') || snippetLower.includes('désabonner')) {
    return {
      category: 'promotional',
      confidence: 0.80,
      suggestedAction: 'unsubscribe_or_delete',
      reasoning: 'Email promotionnel détecté'
    };
  }
  
  // Réseaux sociaux
  if (fromLower.includes('facebook') || fromLower.includes('twitter') || 
      fromLower.includes('linkedin') || fromLower.includes('instagram') || 
      fromLower.includes('notification') || fromLower.includes('@facebook') ||
      subjectLower.includes('a aimé') || subjectLower.includes('notification')) {
    return {
      category: 'social',
      confidence: 0.85,
      suggestedAction: 'organize_or_delete',
      reasoning: 'Notification de réseau social'
    };
  }
  
  // Newsletters
  if (subjectLower.includes('newsletter') || subjectLower.includes('bulletin') || 
      fromLower.includes('newsletter') || fromLower.includes('no-reply') ||
      fromLower.includes('noreply')) {
    return {
      category: 'newsletter',
      confidence: 0.80,
      suggestedAction: 'organize',
      reasoning: 'Newsletter détectée'
    };
  }
  
  // Spam potentiel
  if (subjectLower.includes('urgent') || subjectLower.includes('félicitations') || 
      subjectLower.includes('gratuit') || subjectLower.includes('gagné') || 
      subjectLower.includes('winner') || subjectLower.includes('congratulations')) {
    return {
      category: 'spam',
      confidence: 0.75,
      suggestedAction: 'delete',
      reasoning: 'Contenu suspect de spam'
    };
  }
  
  // Notifications système
  if (fromLower.includes('notification') || fromLower.includes('alert') || 
      subjectLower.includes('rappel') || subjectLower.includes('reminder')) {
    return {
      category: 'notification',
      confidence: 0.70,
      suggestedAction: 'organize',
      reasoning: 'Notification système'
    };
  }
  
  // Par défaut
  return {
    category: 'other',
    confidence: 0.50,
    suggestedAction: 'review',
    reasoning: 'Classification automatique non déterminée'
  };
}

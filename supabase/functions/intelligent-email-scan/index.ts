
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 intelligent-email-scan - Début de la fonction');
    console.log('📋 Method:', req.method);
    console.log('📋 Content-Type:', req.headers.get('content-type'));
    console.log('📋 URL:', req.url);
    
    // Vérifier la méthode HTTP
    if (req.method !== 'POST') {
      console.error('❌ Méthode HTTP incorrecte:', req.method);
      return new Response(
        JSON.stringify({ error: 'Méthode non autorisée. Utilisez POST.' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Récupérer et parser le body de façon plus robuste
    let requestBody;
    let bodyText = '';
    
    try {
      // Cloner la requête pour pouvoir la lire plusieurs fois si nécessaire
      const clonedRequest = req.clone();
      bodyText = await clonedRequest.text();
      
      console.log('📄 Body text longueur:', bodyText.length);
      console.log('📄 Body text preview:', bodyText.substring(0, 200));
      
      if (!bodyText || bodyText.trim() === '') {
        console.error('❌ Corps de requête vide ou null');
        return new Response(
          JSON.stringify({ 
            error: 'Corps de requête vide',
            details: 'Le token d\'accès est requis dans le corps de la requête'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      requestBody = JSON.parse(bodyText);
      console.log('✅ Body parsé avec succès, clés:', Object.keys(requestBody));
      
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.error('❌ Body text qui a causé l\'erreur:', bodyText);
      return new Response(
        JSON.stringify({ 
          error: 'Format JSON invalide',
          details: parseError instanceof Error ? parseError.message : 'Erreur de parsing inconnue',
          receivedBody: bodyText.substring(0, 500) // Limiter pour éviter les logs trop longs
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Vérifier la présence du token
    const { accessToken } = requestBody;
    
    if (!accessToken || typeof accessToken !== 'string') {
      console.error('❌ Token d\'accès manquant ou invalide:', typeof accessToken);
      return new Response(
        JSON.stringify({ 
          error: 'Token d\'accès requis',
          details: 'Le token d\'accès Gmail doit être fourni en tant que string'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('🔑 Token reçu, longueur:', accessToken.length);
    console.log('🔑 Token début:', accessToken.substring(0, 20) + "...");

    // Test de validité du token
    console.log('🧪 Test de validité du token...');
    const testResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🧪 Status de la réponse test:', testResponse.status);

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ Token invalide:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        body: errorText.substring(0, 500)
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Token d'accès Gmail invalide (${testResponse.status})`,
          details: errorText,
          hint: testResponse.status === 401 ? 'Token expiré, veuillez vous reconnecter' : 'Vérifiez les permissions du token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const profile = await testResponse.json();
    console.log('✅ Profil Gmail récupéré:', profile.emailAddress);

    // Récupérer les emails avec pagination
    console.log('📧 Début récupération des emails...');
    const searchQuery = 'is:unread';
    let allMessageIds: string[] = [];
    let nextPageToken: string | undefined;
    let totalFetched = 0;

    // Récupérer les IDs des emails non lus
    do {
      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=500${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('❌ Erreur recherche Gmail:', errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Erreur lors de la recherche des emails',
            details: errorText
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const searchData = await searchResponse.json();
      
      if (searchData.messages) {
        allMessageIds.push(...searchData.messages.map((msg: any) => msg.id));
        totalFetched += searchData.messages.length;
      }
      
      nextPageToken = searchData.nextPageToken;
      console.log(`📊 Récupéré ${totalFetched} IDs d'emails jusqu'à présent...`);
      
      // Limiter pour éviter les timeouts
      if (totalFetched >= 2000) {
        console.log('⚠️ Limite de 2000 emails atteinte pour éviter les timeouts');
        break;
      }
      
    } while (nextPageToken);

    console.log(`✅ Total ${allMessageIds.length} emails non lus trouvés`);

    // Récupérer les détails des emails
    const emails: any[] = [];
    const batchSize = 50;
    const maxEmails = Math.min(allMessageIds.length, 1000);

    for (let i = 0; i < maxEmails; i += batchSize) {
      const batch = allMessageIds.slice(i, i + batchSize);
      console.log(`📄 Récupération détails emails ${i + 1} à ${Math.min(i + batchSize, maxEmails)}...`);
      
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
            
            // Vérifier si l'email est vraiment non lu
            const isUnread = messageData.labelIds?.includes('UNREAD') || false;
            
            // Classification simple basée sur l'expéditeur et le sujet
            let classification = {
              category: 'other',
              confidence: 0.5,
              suggestedAction: 'review',
              reasoning: 'Classification automatique'
            };

            const subjectLower = subject.toLowerCase();
            const fromLower = from.toLowerCase();

            if (fromLower.includes('noreply') || fromLower.includes('no-reply') || 
                subjectLower.includes('newsletter') || subjectLower.includes('unsubscribe')) {
              classification = {
                category: 'promotional',
                confidence: 0.8,
                suggestedAction: 'delete',
                reasoning: 'Email promotionnel détecté'
              };
            } else if (fromLower.includes('facebook') || fromLower.includes('twitter') || 
                      fromLower.includes('linkedin') || fromLower.includes('instagram')) {
              classification = {
                category: 'social',
                confidence: 0.9,
                suggestedAction: 'archive',
                reasoning: 'Notification de réseau social'
              };
            } else if (subjectLower.includes('notification') || subjectLower.includes('alert') ||
                      subjectLower.includes('reminder')) {
              classification = {
                category: 'notification',
                confidence: 0.7,
                suggestedAction: 'review',
                reasoning: 'Email de notification'
              };
            }

            return {
              id: messageId,
              subject: subject.length > 100 ? subject.substring(0, 100) + '...' : subject,
              from: from.includes('<') ? from.split('<')[0].trim() : from,
              date: emailDate.toISOString(),
              size: Math.round((messageData.sizeEstimate || 10000) / 1024),
              snippet: messageData.snippet || '',
              isUnread,
              daysSinceReceived,
              classification
            };
          }
        } catch (error) {
          console.error(`❌ Erreur récupération email ${messageId}:`, error);
        }
        return null;
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(email => email !== null);
      emails.push(...validResults);
      
      // Pause entre les batches
      if (i + batchSize < maxEmails) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Détails récupérés pour ${emails.length} emails`);

    // Calculer les statistiques
    const oldUnreadEmails = emails.filter(e => e.isUnread && e.daysSinceReceived > 180).length;
    const promotionalEmails = emails.filter(e => e.classification.category === 'promotional').length;
    const socialEmails = emails.filter(e => e.classification.category === 'social').length;
    const notificationEmails = emails.filter(e => e.classification.category === 'notification').length;
    const spamEmails = emails.filter(e => e.classification.category === 'spam').length;
    const autoClassifiableEmails = emails.filter(e => e.classification.category !== 'other').length;

    const totalSize = emails.reduce((sum, email) => sum + (email.size || 0), 0);
    const totalSizeMB = totalSize / 1024;
    const carbonFootprint = allMessageIds.length * 10;

    const results = {
      totalEmails: allMessageIds.length,
      totalSizeMB,
      carbonFootprint,
      emails: emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      summary: {
        oldUnreadEmails,
        promotionalEmails,
        socialEmails,
        notificationEmails,
        spamEmails,
        autoClassifiableEmails,
        duplicateSenderEmails: 0
      }
    };

    console.log('✅ Scan terminé avec succès:', {
      totalEmails: results.totalEmails,
      emailsProcessed: results.emails.length,
      oldUnreadEmails: results.summary.oldUnreadEmails,
      promotionalEmails: results.summary.promotionalEmails
    });

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ERREUR GLOBALE dans intelligent-email-scan:', error);
    console.error('❌ Type:', typeof error);
    console.error('❌ Message:', error instanceof Error ? error.message : 'Erreur inconnue');
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue lors du scan',
        details: 'Consultez les logs de la fonction pour plus d\'informations',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
}

interface ScanResults {
  totalEmails: number;
  totalSizeMB: number;
  carbonFootprint: number;
  emails: EmailData[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken } = await req.json();
    
    console.log('🚀 DEBUG - Début fonction scan-gmail');
    console.log('🔑 DEBUG - Token reçu - longueur:', accessToken?.length);
    console.log('🔑 DEBUG - Token reçu - début:', accessToken?.substring(0, 20) + "...");
    
    if (!accessToken) {
      console.error('❌ DEBUG - Aucun token d\'accès fourni');
      throw new Error('Access token is required');
    }

    console.log('📧 DEBUG - Début scan Gmail pour emails non lus...');

    // Test de la validité du token avec un appel simple
    console.log('🧪 DEBUG - Test de validité du token...');
    const testResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🧪 DEBUG - Réponse test token:', {
      status: testResponse.status,
      statusText: testResponse.statusText,
      ok: testResponse.ok
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ DEBUG - Token invalide:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        body: errorText
      });
      
      if (testResponse.status === 401) {
        throw new Error('Token d\'accès Gmail expiré ou invalide. Veuillez vous reconnecter.');
      }
      
      throw new Error(`Erreur d'authentification Gmail: ${testResponse.status} ${testResponse.statusText}`);
    }

    const profile = await testResponse.json();
    console.log('✅ DEBUG - Profil Gmail récupéré:', {
      emailAddress: profile.emailAddress,
      messagesTotal: profile.messagesTotal,
      historyId: profile.historyId
    });

    // Récupérer tous les emails non lus avec pagination
    const searchQuery = 'is:unread';
    let allMessageIds: string[] = [];
    let nextPageToken: string | undefined;

    // Récupérer tous les IDs des emails non lus avec pagination
    do {
      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=500${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!searchResponse.ok) {
        console.error('Gmail API search error:', await searchResponse.text());
        throw new Error('Erreur lors de la recherche des emails');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.messages) {
        allMessageIds.push(...searchData.messages.map((msg: any) => msg.id));
      }
      
      nextPageToken = searchData.nextPageToken;
      
      console.log(`Récupéré ${allMessageIds.length} IDs d'emails jusqu'à présent...`);
      
    } while (nextPageToken);

    const totalEmails = allMessageIds.length;
    console.log(`Found ${totalEmails} unread emails total`);

    let allEmails: EmailData[] = [];

    if (allMessageIds.length > 0) {
      // Récupérer les détails des emails par batch pour éviter les timeouts
      const batchSize = 100;
      
      for (let i = 0; i < allMessageIds.length; i += batchSize) {
        const batch = allMessageIds.slice(i, i + batchSize);
        console.log(`Fetching details for emails ${i + 1} to ${Math.min(i + batchSize, allMessageIds.length)}...`);
        
        // Traiter le batch en parallèle avec une limite
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
              
              const emailDate = dateHeader ? new Date(dateHeader) : new Date();
              
              // Estimer la taille en Ko
              const sizeInKb = Math.round((messageData.sizeEstimate || 10000) / 1024);

              return {
                id: messageId,
                subject: subject.length > 100 ? subject.substring(0, 100) + '...' : subject,
                from: from.includes('<') ? from.split('<')[0].trim() : from,
                date: emailDate.toISOString(),
                size: sizeInKb,
              };
            }
          } catch (error) {
            console.error(`Error fetching message ${messageId}:`, error);
          }
          return null;
        });

        // Attendre que le batch soit traité
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter((email): email is EmailData => email !== null);
        allEmails.push(...validResults);
        
        // Petite pause entre les batches pour éviter de surcharger l'API
        if (i + batchSize < allMessageIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // Trier les emails par date (plus récents en premier)
    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculer les totaux
    const totalSize = allEmails.reduce((sum, email) => sum + (email.size || 0), 0);
    const totalSizeMB = totalSize / 1024;
    
    // Calcul carbone basé sur le nombre total d'emails
    const carbonFootprint = totalEmails * 10; // 10g par email

    const results: ScanResults = {
      totalEmails,
      totalSizeMB,
      carbonFootprint,
      emails: allEmails,
    };

    console.log('Email scan completed:', {
      totalEmails: results.totalEmails,
      emailsRetrieved: results.emails.length,
      totalSizeMB: results.totalSizeMB,
      carbonFootprint: results.carbonFootprint,
    });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ DEBUG - Erreur dans scan-gmail function:', error);
    console.error('❌ DEBUG - Type erreur:', typeof error);
    console.error('❌ DEBUG - Message erreur:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ DEBUG - Stack trace:', error instanceof Error ? error.stack : 'No stack');
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Check the function logs for more information',
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

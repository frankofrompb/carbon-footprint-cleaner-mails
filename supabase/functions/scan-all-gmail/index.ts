
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
    
    if (!accessToken) {
      throw new Error('Access token is required');
    }

    console.log('Starting Gmail scan with quota management...');

    // Récupérer les emails avec pagination limitée pour éviter les quotas
    let allMessageIds: string[] = [];
    let nextPageToken: string | undefined;
    let pageCount = 0;
    const maxPages = 5; // Limiter à 5 pages pour éviter les quotas

    // Récupérer les IDs des emails avec pagination limitée
    do {
      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Gmail API search error:', errorText);
        
        if (searchResponse.status === 403) {
          throw new Error('Limite de quota Gmail atteinte. Veuillez réessayer dans quelques minutes.');
        }
        
        throw new Error('Erreur lors de la recherche des emails');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.messages) {
        allMessageIds.push(...searchData.messages.map((msg: any) => msg.id));
      }
      
      nextPageToken = searchData.nextPageToken;
      pageCount++;
      
      console.log(`Page ${pageCount}: Récupéré ${allMessageIds.length} IDs d'emails...`);
      
      // Pause entre les requêtes pour respecter les limites
      if (nextPageToken && pageCount < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
    } while (nextPageToken && pageCount < maxPages);

    const totalEmails = allMessageIds.length;
    console.log(`Found ${totalEmails} emails total`);

    let allEmails: EmailData[] = [];

    if (allMessageIds.length > 0) {
      // Récupérer les détails des emails par petits batches avec des pauses
      const batchSize = 20; // Réduire la taille des batches
      
      for (let i = 0; i < allMessageIds.length; i += batchSize) {
        const batch = allMessageIds.slice(i, i + batchSize);
        console.log(`Fetching details for emails ${i + 1} to ${Math.min(i + batchSize, allMessageIds.length)}...`);
        
        // Traiter le batch avec une limite plus conservative
        const batchPromises = batch.map(async (messageId, index) => {
          try {
            // Ajouter un délai progressif pour éviter les pics de requêtes
            await new Promise(resolve => setTimeout(resolve, index * 50));
            
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
            } else if (messageResponse.status === 403) {
              console.warn('Quota exceeded, stopping batch processing');
              return null;
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
        
        // Pause plus longue entre les batches pour respecter les quotas
        if (i + batchSize < allMessageIds.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
    console.error('Error in scan-all-gmail function:', error);
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

serve(handler);

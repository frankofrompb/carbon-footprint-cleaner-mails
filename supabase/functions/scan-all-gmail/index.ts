
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

    console.log('Starting Gmail scan with very conservative quota management...');

    // Approche très conservative : limiter drastiquement pour éviter les quotas
    let allMessageIds: string[] = [];
    let nextPageToken: string | undefined;
    let pageCount = 0;
    const maxPages = 2; // Encore plus restrictif : seulement 2 pages
    const maxResults = 50; // Réduire encore plus le nombre de résultats par page

    // Récupérer les IDs des emails avec pagination très limitée
    do {
      console.log(`Fetching page ${pageCount + 1}...`);
      
      try {
        const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        
        const searchResponse = await fetch(searchUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error('Gmail API search error:', errorText);
          
          if (searchResponse.status === 403 || searchResponse.status === 429) {
            throw new Error('Limite de quota Gmail atteinte. Veuillez réessayer dans quelques minutes.');
          }
          
          throw new Error(`Erreur Gmail API (${searchResponse.status}): ${errorText}`);
        }

        const searchData = await searchResponse.json();
        
        if (searchData.messages) {
          allMessageIds.push(...searchData.messages.map((msg: any) => msg.id));
        }
        
        nextPageToken = searchData.nextPageToken;
        pageCount++;
        
        console.log(`Page ${pageCount}: Récupéré ${allMessageIds.length} IDs d'emails...`);
        
        // Pause obligatoire entre les requêtes pour respecter les limites
        if (nextPageToken && pageCount < maxPages) {
          console.log('Waiting 1 second before next page...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Error on page ${pageCount + 1}:`, error);
        if (error instanceof Error && error.message.includes('quota')) {
          throw error;
        }
        break; // Arrêter en cas d'erreur non-quota
      }
      
    } while (nextPageToken && pageCount < maxPages);

    const totalEmails = allMessageIds.length;
    console.log(`Found ${totalEmails} emails total`);

    let allEmails: EmailData[] = [];

    if (allMessageIds.length > 0) {
      // Traiter seulement les premiers emails pour éviter les quotas
      const maxEmailsToProcess = Math.min(allMessageIds.length, 50); // Maximum 50 emails
      const emailsToProcess = allMessageIds.slice(0, maxEmailsToProcess);
      
      console.log(`Processing details for ${emailsToProcess.length} emails...`);
      
      // Traiter un par un avec des pauses importantes
      for (let i = 0; i < emailsToProcess.length; i++) {
        const messageId = emailsToProcess[i];
        
        try {
          console.log(`Processing email ${i + 1}/${emailsToProcess.length}...`);
          
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

            allEmails.push({
              id: messageId,
              subject: subject.length > 100 ? subject.substring(0, 100) + '...' : subject,
              from: from.includes('<') ? from.split('<')[0].trim() : from,
              date: emailDate.toISOString(),
              size: sizeInKb,
            });
            
          } else if (messageResponse.status === 403 || messageResponse.status === 429) {
            console.warn(`Quota exceeded at email ${i + 1}, stopping processing`);
            break;
          } else {
            console.warn(`Failed to fetch email ${messageId}: ${messageResponse.status}`);
          }
          
          // Pause obligatoire entre chaque email pour respecter les quotas
          if (i < emailsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
        } catch (error) {
          console.error(`Error processing email ${messageId}:`, error);
          // Continuer avec le suivant
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

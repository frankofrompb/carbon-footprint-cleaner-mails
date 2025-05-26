
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

    console.log('Starting Gmail scan for unread emails older than 6 months...');

    // Calculer la date d'il y a exactement 6 mois (180 jours)
    const today = new Date();
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - 180);
    
    // Format YYYY/MM/DD pour la requête Gmail
    const year = cutoffDate.getFullYear();
    const month = String(cutoffDate.getMonth() + 1).padStart(2, '0');
    const day = String(cutoffDate.getDate()).padStart(2, '0');
    const dateQuery = `${year}/${month}/${day}`;
    
    // Utiliser "before:" pour la date de réception et "is:unread" pour les non lus
    const searchQuery = `is:unread before:${dateQuery}`;
    
    console.log(`Search query for unread emails older than 6 months: ${searchQuery}`);
    console.log(`Searching for emails received before: ${dateQuery} (${cutoffDate.toISOString()})`);
    console.log(`Today is: ${today.toISOString()}`);

    // Appel à l'API Gmail pour rechercher les emails
    const searchResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=500`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.text();
      console.error('Gmail API search error:', errorData);
      throw new Error(`Gmail API error: ${searchResponse.status} - ${errorData}`);
    }

    const searchData = await searchResponse.json();
    console.log('Search results summary:', {
      resultSizeEstimate: searchData.resultSizeEstimate,
      messagesFound: searchData.messages?.length || 0,
      nextPageToken: searchData.nextPageToken ? 'present' : 'none'
    });

    if (!searchData.messages || searchData.messages.length === 0) {
      console.log('No unread emails older than 6 months found');
      return new Response(JSON.stringify({
        totalEmails: 0,
        totalSizeMB: 0,
        carbonFootprint: 0,
        emails: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupérer les détails des premiers 50 emails pour l'affichage
    const emailsToFetch = searchData.messages.slice(0, 50);
    const emails: EmailData[] = [];
    let totalSize = 0;
    let validEmailsCount = 0;

    console.log(`Fetching details for ${emailsToFetch.length} unread emails older than 6 months...`);

    for (const message of emailsToFetch) {
      try {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
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
          
          // Vérifier strictement que l'email est plus ancien que 6 mois (180 jours)
          const emailDate = dateHeader ? new Date(dateHeader) : new Date();
          const daysDifference = Math.floor((today.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDifference < 180) {
            console.log(`Skipping email from ${emailDate.toISOString()} (${daysDifference} days old) - not older than 6 months`);
            continue;
          }
          
          validEmailsCount++;
          console.log(`Valid email found from ${emailDate.toISOString()} (${daysDifference} days old)`);
          
          // Estimer la taille en Ko (sizeEstimate est en bytes)
          const sizeInKb = Math.round((messageData.sizeEstimate || 10000) / 1024);
          totalSize += sizeInKb;

          emails.push({
            id: message.id,
            subject: subject.length > 100 ? subject.substring(0, 100) + '...' : subject,
            from: from.includes('<') ? from.split('<')[0].trim() : from,
            date: emailDate.toISOString(),
            size: sizeInKb,
          });
        }
      } catch (error) {
        console.error(`Error fetching message ${message.id}:`, error);
      }
    }

    // Utiliser le nombre d'emails réellement valides (plus anciens que 6 mois)
    const totalEmails = validEmailsCount;
    const totalSizeMB = totalSize / 1024;
    const carbonFootprint = totalEmails * 10; // 10g par email

    const results: ScanResults = {
      totalEmails,
      totalSizeMB,
      carbonFootprint,
      emails,
    };

    console.log('Unread emails scan completed:', {
      totalEmails: results.totalEmails,
      totalSizeMB: results.totalSizeMB,
      carbonFootprint: results.carbonFootprint,
      emailsDisplayed: results.emails.length,
      searchDate: dateQuery,
      validEmailsFound: validEmailsCount,
      totalEmailsFromAPI: searchData.messages.length
    });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scan-gmail function:', error);
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

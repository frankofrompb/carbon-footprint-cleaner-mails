
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

    console.log('Starting Gmail scan...');

    // TEST SPECIFIQUE POUR 2020 : chercher TOUS les emails de 2020 (lus et non lus)
    // Période de test : du 1er janvier 2020 au 31 décembre 2020
    const searchQuery = `after:2020/01/01 before:2021/01/01`;
    
    console.log('Search query for 2020 test:', searchQuery);

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
    console.log('Search results:', searchData);

    if (!searchData.messages || searchData.messages.length === 0) {
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

    console.log(`Fetching details for ${emailsToFetch.length} emails from 2020...`);

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
          
          // Estimer la taille en Ko (sizeEstimate est en bytes)
          const sizeInKb = Math.round((messageData.sizeEstimate || 10000) / 1024);
          totalSize += sizeInKb;

          emails.push({
            id: message.id,
            subject: subject.length > 100 ? subject.substring(0, 100) + '...' : subject,
            from: from.includes('<') ? from.split('<')[0].trim() : from,
            date: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString(),
            size: sizeInKb,
          });
        }
      } catch (error) {
        console.error(`Error fetching message ${message.id}:`, error);
      }
    }

    const totalEmails = searchData.resultSizeEstimate || searchData.messages.length;
    const totalSizeMB = totalSize / 1024;
    const carbonFootprint = totalEmails * 10; // 10g par email

    const results: ScanResults = {
      totalEmails,
      totalSizeMB,
      carbonFootprint,
      emails,
    };

    console.log('2020 scan completed:', results);

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

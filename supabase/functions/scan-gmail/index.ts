
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

    console.log('Starting Gmail scan for unread emails...');

    // Récupérer les emails non lus avec un nombre plus élevé
    const searchQuery = 'is:unread';
    
    const searchResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!searchResponse.ok) {
      console.error('Gmail API search error:', await searchResponse.text());
      throw new Error('Erreur lors de la recherche des emails');
    }

    const searchData = await searchResponse.json();
    const totalEmails = searchData.resultSizeEstimate || 0;
    
    console.log(`Found ${totalEmails} unread emails`);

    let allEmails: EmailData[] = [];

    if (searchData.messages && searchData.messages.length > 0) {
      // Récupérer les détails des emails (limité à 50 pour éviter les timeouts)
      const emailsToFetch = searchData.messages.slice(0, 50);
      
      console.log(`Fetching details for ${emailsToFetch.length} emails...`);
      
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
            
            const emailDate = dateHeader ? new Date(dateHeader) : new Date();
            
            // Estimer la taille en Ko
            const sizeInKb = Math.round((messageData.sizeEstimate || 10000) / 1024);

            allEmails.push({
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
    }

    // Trier les emails par date (plus récents en premier)
    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculer les totaux basés sur les emails récupérés
    const totalSize = allEmails.reduce((sum, email) => sum + (email.size || 0), 0);
    const totalSizeMB = totalSize / 1024;
    
    // Utiliser le nombre total réel d'emails pour le calcul carbone
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

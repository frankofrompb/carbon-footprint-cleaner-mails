
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

    console.log('Starting Gmail scan for all emails from 2000 to 2024...');

    // Recherche par années pour avoir une meilleure distribution
    const years = ['2000', '2005', '2010', '2015', '2020', '2024'];
    let allEmails: EmailData[] = [];
    let totalEmailsFound = 0;

    for (const year of years) {
      try {
        console.log(`Searching emails for year ${year}...`);
        
        const searchQuery = `after:${year}/01/01 before:${year}/12/31`;
        
        const searchResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=10`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!searchResponse.ok) {
          console.error(`Gmail API search error for year ${year}:`, await searchResponse.text());
          continue;
        }

        const searchData = await searchResponse.json();
        const emailsForYear = searchData.resultSizeEstimate || 0;
        totalEmailsFound += emailsForYear;
        
        console.log(`Found ${emailsForYear} emails for year ${year}`);

        if (searchData.messages && searchData.messages.length > 0) {
          // Récupérer les détails de quelques emails pour cette année
          const emailsToFetch = searchData.messages.slice(0, 5);
          
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
                const emailYear = emailDate.getFullYear();
                
                console.log(`Email from ${emailDate.toISOString()} (year ${emailYear})`);
                
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
      } catch (error) {
        console.error(`Error searching emails for year ${year}:`, error);
      }
    }

    // Faire une recherche globale pour avoir le nombre total exact
    console.log('Getting total count for all years...');
    const globalSearchQuery = `after:2000/01/01 before:2025/01/01`;
    
    try {
      const globalSearchResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(globalSearchQuery)}&maxResults=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (globalSearchResponse.ok) {
        const globalSearchData = await globalSearchResponse.json();
        totalEmailsFound = globalSearchData.resultSizeEstimate || totalEmailsFound;
        console.log(`Total emails found across all years: ${totalEmailsFound}`);
      }
    } catch (error) {
      console.error('Error getting global count:', error);
    }

    // Trier les emails par date (plus récents en premier)
    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculer les totaux
    const totalSize = allEmails.reduce((sum, email) => sum + (email.size || 0), 0);
    const totalSizeMB = totalSize / 1024;
    const carbonFootprint = totalEmailsFound * 10; // 10g par email

    const results: ScanResults = {
      totalEmails: totalEmailsFound,
      totalSizeMB,
      carbonFootprint,
      emails: allEmails,
    };

    console.log('Email scan completed for 2000-2024:', {
      totalEmails: results.totalEmails,
      totalSizeMB: results.totalSizeMB,
      carbonFootprint: results.carbonFootprint,
      emailsDisplayed: results.emails.length,
      yearsCovered: years,
      emailsPerYear: allEmails.reduce((acc, email) => {
        const year = new Date(email.date).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
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

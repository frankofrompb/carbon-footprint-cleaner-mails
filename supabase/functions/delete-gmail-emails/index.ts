
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
    const { accessToken, emailIds } = await req.json();
    
    if (!accessToken || !emailIds || !Array.isArray(emailIds)) {
      throw new Error('Access token and email IDs are required');
    }

    console.log(`Starting deletion of ${emailIds.length} emails...`);

    // Supprimer les emails par lots pour éviter les timeouts
    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < emailIds.length; i += batchSize) {
      const batch = emailIds.slice(i, i + batchSize);
      
      try {
        // Utiliser l'API batch delete de Gmail
        const batchDeleteResponse = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ids: batch
            }),
          }
        );

        if (batchDeleteResponse.ok) {
          deletedCount += batch.length;
          console.log(`Deleted batch ${Math.floor(i / batchSize) + 1}, total deleted: ${deletedCount}`);
        } else {
          const errorData = await batchDeleteResponse.text();
          console.error(`Batch delete error:`, errorData);
        }
      } catch (error) {
        console.error(`Error deleting batch starting at ${i}:`, error);
      }
    }

    console.log(`Deletion completed. Deleted ${deletedCount} emails.`);

    return new Response(JSON.stringify({ 
      success: true, 
      deletedCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in delete-gmail-emails function:', error);
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

serve(handler);

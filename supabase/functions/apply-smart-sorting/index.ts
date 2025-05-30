
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken, folderActions } = await req.json();

    console.log(`Applying smart sorting for ${Object.keys(folderActions).length} folders`);

    if (!accessToken) {
      throw new Error('Token d\'accès manquant');
    }

    if (!folderActions || typeof folderActions !== 'object') {
      throw new Error('Actions de dossier invalides');
    }

    let totalProcessed = 0;
    const results = [];

    for (const [folderName, emailIds] of Object.entries(folderActions)) {
      if (!Array.isArray(emailIds) || emailIds.length === 0) {
        console.log(`Skipping folder ${folderName} - no emails`);
        continue;
      }

      try {
        console.log(`Processing folder: ${folderName} with ${emailIds.length} emails`);
        
        // Créer ou récupérer le libellé
        const labelId = await createOrGetLabel(accessToken, folderName);
        
        // Appliquer le libellé aux emails
        const processed = await applyLabelToEmails(accessToken, emailIds, labelId);
        
        results.push({
          folder: folderName,
          emailsProcessed: processed,
          success: true
        });
        
        totalProcessed += processed;
        console.log(`Successfully processed ${processed} emails for folder ${folderName}`);
      } catch (error) {
        console.error(`Error processing folder ${folderName}:`, error);
        results.push({
          folder: folderName,
          emailsProcessed: 0,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalProcessed,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error applying smart sorting:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de l\'application du tri',
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function createOrGetLabel(accessToken: string, labelName: string): Promise<string> {
  try {
    // D'abord, vérifier si le libellé existe déjà
    console.log(`Checking if label "${labelName}" exists...`);
    
    const listResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/labels',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error(`Failed to list labels: ${listResponse.status} - ${errorText}`);
      throw new Error(`Échec de la récupération des libellés: ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    const existingLabel = listData.labels?.find((label: any) => label.name === labelName);

    if (existingLabel) {
      console.log(`Using existing label: ${labelName} (ID: ${existingLabel.id})`);
      return existingLabel.id;
    }

    // Créer le nouveau libellé
    console.log(`Creating new label: ${labelName}`);
    const createResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/labels',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error(`Failed to create label: ${createResponse.status} - ${errorText}`);
      throw new Error(`Échec de la création du libellé: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    console.log(`Created new label: ${labelName} (ID: ${createData.id})`);
    return createData.id;
  } catch (error) {
    console.error(`Error in createOrGetLabel for "${labelName}":`, error);
    throw error;
  }
}

async function applyLabelToEmails(accessToken: string, emailIds: string[], labelId: string): Promise<number> {
  let processed = 0;
  const batchSize = 100; // Gmail API limit

  console.log(`Applying label to ${emailIds.length} emails in batches of ${batchSize}`);

  for (let i = 0; i < emailIds.length; i += batchSize) {
    const batch = emailIds.slice(i, i + batchSize);
    
    try {
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emailIds.length / batchSize)} with ${batch.length} emails`);
      
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: batch,
            addLabelIds: [labelId],
            removeLabelIds: ['INBOX'] // Retirer de la boîte de réception
          }),
        }
      );

      if (response.ok) {
        processed += batch.length;
        console.log(`Successfully processed batch of ${batch.length} emails`);
      } else {
        const errorText = await response.text();
        console.error(`Failed to process batch: ${response.status} - ${errorText}`);
        throw new Error(`Échec du traitement du batch: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error processing batch:`, error);
      throw error;
    }

    // Petite pause entre les batches pour éviter les limites de taux
    if (i + batchSize < emailIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return processed;
}

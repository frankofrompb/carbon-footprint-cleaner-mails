
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailClassification {
  category: string;
  confidence: number;
  suggestedFolder: string;
}

interface ClassifiedEmail {
  id: string;
  subject: string;
  from: string;
  classification: EmailClassification;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken, emails, period } = await req.json();

    console.log(`Starting smart sorting for ${emails?.length || 0} emails with period: ${period}`);

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error("Aucun email fourni pour la classification");
    }

    // Vérifier la clé API OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('Clé API OpenAI manquante. Veuillez la configurer dans les secrets Supabase.');
    }

    console.log('OpenAI API key found, proceeding with classification...');

    // Classifier les emails par batch
    const classifiedEmails: ClassifiedEmail[] = [];
    const batchSize = 10;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emails.length / batchSize)}`);

      try {
        const batchClassifications = await classifyEmailBatch(batch, openAIApiKey);
        classifiedEmails.push(...batchClassifications);
      } catch (error) {
        console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, error);
        // Continuer avec le batch suivant en cas d'erreur
        const fallbackClassifications = batch.map(email => ({
          id: email.id,
          subject: email.subject,
          from: email.from,
          classification: {
            category: 'other',
            confidence: 0.5,
            suggestedFolder: 'Autres'
          }
        }));
        classifiedEmails.push(...fallbackClassifications);
      }
    }

    // Grouper par catégorie
    const categorizedEmails = groupEmailsByCategory(classifiedEmails);

    console.log(`Classification completed: ${classifiedEmails.length} emails processed into ${Object.keys(categorizedEmails).length} categories`);

    return new Response(
      JSON.stringify({
        success: true,
        categorizedEmails,
        totalProcessed: classifiedEmails.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in smart email sorting:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de la classification des emails',
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function classifyEmailBatch(emails: any[], openAIApiKey: string): Promise<ClassifiedEmail[]> {
  if (!emails || emails.length === 0) {
    return [];
  }

  const emailTexts = emails.map(email => 
    `Subject: ${email.subject || 'Sans sujet'}\nFrom: ${email.from || 'Expéditeur inconnu'}\nSnippet: ${email.snippet || ''}`
  ).join('\n---\n');

  const prompt = `Analyse ces emails et classe chacun dans une catégorie. Retourne un array JSON avec les classifications pour chaque email dans le même ordre.

Catégories disponibles:
- "order_confirmation" (confirmations de commande, reçus, confirmations d'achat)
- "newsletter" (newsletters, emails marketing, promotions)
- "invoice" (factures, facturation, notifications de paiement)
- "social" (notifications des réseaux sociaux, commentaires, likes)
- "travel" (confirmations de réservation, itinéraires de voyage, billets)
- "bank" (relevés bancaires, notifications de compte, alertes de paiement)
- "work" (emails professionnels, invitations à des réunions, communications de travail)
- "support" (support client, help desk, assistance technique)
- "other" (tout le reste)

Pour chaque email, fournis:
- category: une des catégories ci-dessus
- confidence: nombre entre 0 et 1
- suggestedFolder: nom français pour le dossier (ex: "Confirmations de commande", "Newsletters", etc.)

Emails à analyser:
${emailTexts}`;

  try {
    console.log(`Making OpenAI API call for ${emails.length} emails...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en classification d\'emails. Réponds toujours avec un array JSON valide correspondant exactement au nombre d\'emails en entrée.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`Erreur API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Réponse invalide de l\'API OpenAI');
    }

    console.log('OpenAI response received, parsing classifications...');
    
    let classifications;
    try {
      classifications = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Erreur lors du parsing de la réponse OpenAI');
    }

    if (!Array.isArray(classifications)) {
      throw new Error('La réponse OpenAI n\'est pas un array');
    }

    return emails.map((email, index) => ({
      id: email.id,
      subject: email.subject || 'Sans sujet',
      from: email.from || 'Expéditeur inconnu',
      classification: classifications[index] || {
        category: 'other',
        confidence: 0.5,
        suggestedFolder: 'Autres'
      }
    }));
  } catch (error) {
    console.error('Error in classifyEmailBatch:', error);
    throw error;
  }
}

function groupEmailsByCategory(classifiedEmails: ClassifiedEmail[]): Record<string, ClassifiedEmail[]> {
  const groups: Record<string, ClassifiedEmail[]> = {};
  
  classifiedEmails.forEach(email => {
    const folder = email.classification.suggestedFolder || 'Autres';
    if (!groups[folder]) {
      groups[folder] = [];
    }
    groups[folder].push(email);
  });

  return groups;
}

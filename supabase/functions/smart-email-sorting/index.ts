
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

    console.log(`Starting smart sorting for ${emails.length} emails with period: ${period}`);

    // Classifier les emails par batch
    const classifiedEmails: ClassifiedEmail[] = [];
    const batchSize = 10;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emails.length / batchSize)}`);

      const batchClassifications = await classifyEmailBatch(batch);
      classifiedEmails.push(...batchClassifications);
    }

    // Grouper par catégorie
    const categorizedEmails = groupEmailsByCategory(classifiedEmails);

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function classifyEmailBatch(emails: any[]): Promise<ClassifiedEmail[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const emailTexts = emails.map(email => 
    `Subject: ${email.subject}\nFrom: ${email.from}\nSnippet: ${email.snippet || ''}`
  ).join('\n---\n');

  const prompt = `Analyze these emails and classify each one into categories. Return a JSON array with classifications for each email in the same order.

Categories available:
- "order_confirmation" (confirmations de commande, receipts, order confirmations)
- "newsletter" (newsletters, marketing emails, promotions)
- "invoice" (factures, billing, payment notifications)
- "social" (notifications from social networks, comments, likes)
- "travel" (booking confirmations, travel itineraries, flight tickets)
- "bank" (bank statements, account notifications, payment alerts)
- "work" (professional emails, meeting invites, work communications)
- "support" (customer support, help desk, technical assistance)
- "other" (everything else)

For each email, provide:
- category: one of the categories above
- confidence: number between 0 and 1
- suggestedFolder: French name for the folder (e.g., "Confirmations de commande", "Newsletters", etc.)

Emails to analyze:
${emailTexts}`;

  try {
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
            content: 'You are an email classification expert. Always respond with valid JSON array matching the exact number of input emails.'
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

    const data = await response.json();
    const classifications = JSON.parse(data.choices[0].message.content);

    return emails.map((email, index) => ({
      id: email.id,
      subject: email.subject,
      from: email.from,
      classification: classifications[index] || {
        category: 'other',
        confidence: 0.5,
        suggestedFolder: 'Autres'
      }
    }));
  } catch (error) {
    console.error('Error classifying emails:', error);
    // Fallback classification
    return emails.map(email => ({
      id: email.id,
      subject: email.subject,
      from: email.from,
      classification: {
        category: 'other',
        confidence: 0.5,
        suggestedFolder: 'Autres'
      }
    }));
  }
}

function groupEmailsByCategory(classifiedEmails: ClassifiedEmail[]): Record<string, ClassifiedEmail[]> {
  const groups: Record<string, ClassifiedEmail[]> = {};
  
  classifiedEmails.forEach(email => {
    const folder = email.classification.suggestedFolder;
    if (!groups[folder]) {
      groups[folder] = [];
    }
    groups[folder].push(email);
  });

  return groups;
}

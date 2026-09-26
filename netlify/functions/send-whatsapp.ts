/**
 * Netlify Serverless Function: Send WhatsApp Report
 * Uses environment variables WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID.
 * Secrets are never exposed to the frontend browser.
 */

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        notConfigured: true,
        error: 'WhatsApp service is not configured. Please set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Netlify environment variables.',
      }),
    };
  }

  try {
    const { to, text } = JSON.parse(event.body || '{}');

    if (!to || !text) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Missing recipient phone number (to) or text content.' }),
      };
    }

    // Call official Meta WhatsApp Business Cloud API
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/[\+\s\-]/g, ''),
        type: 'text',
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: data.error?.message || 'Meta WhatsApp API returned an error.',
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        messageId: data.messages?.[0]?.id,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: err.message || 'Internal server error while dispatching WhatsApp message.',
      }),
    };
  }
};

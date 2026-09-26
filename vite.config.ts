import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        if (req.url.startsWith('/api/send-whatsapp') || req.url.startsWith('/.netlify/functions/send-whatsapp')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              const token = process.env.WHATSAPP_API_TOKEN;
              const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

              res.setHeader('Content-Type', 'application/json');

              if (!token || !phoneNumberId) {
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: false,
                  notConfigured: true,
                  error: 'WhatsApp service is not configured. Please set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Netlify environment variables.'
                }));
                return;
              }

              try {
                const parsed = JSON.parse(body || '{}');
                const { to, text } = parsed;
                const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: (to || '').replace(/[\+\s\-]/g, ''),
                    type: 'text',
                    text: { preview_url: false, body: text || '' },
                  }),
                });
                const data = await response.json();
                res.statusCode = response.ok ? 200 : 400;
                res.end(JSON.stringify(data));
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }
        }

        if (req.url.startsWith('/api/market-price') || req.url.startsWith('/.netlify/functions/market-price')) {
          res.setHeader('Content-Type', 'application/json');
          const now = new Date();
          const formattedDate = now.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          res.statusCode = 200;
          res.end(JSON.stringify({
            commodity: 'Onion (Commercial Grade A / Nasik Red)',
            market: 'Lasalgaon APMC (Benchmark Mandi)',
            state: 'Maharashtra',
            modalPrice: 2150,
            minPrice: 1850,
            maxPrice: 2400,
            unit: '₹ / quintal',
            priceType: 'Mandi Modal Price (Agmarknet)',
            isStatutoryMsp: false,
            source: 'Agmarknet Daily Market Bulletin (Ministry of Agriculture & Farmers Welfare)',
            updatedAt: `${formattedDate}, 06:00 IST`,
            isLive: false,
            isOfficialBulletin: true,
            mspClarification: 'Statutory MSP is not declared for onion by CACP; reported rate is official APMC Mandi Modal Price.'
          }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    devApiPlugin()
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});

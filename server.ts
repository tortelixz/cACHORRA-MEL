import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const META_PIXEL_ID = process.env.META_PIXEL_ID || '1441255181536689';
const META_ACCESS_TOKEN =
  process.env.META_ACCESS_TOKEN ||
  'EAAd9XrlRU6MBS8hoyCWP1z54Ikwf0lAPZCeqD5ZBoWPPAzXFFkM8kIZBe2N6X5C454zFkvnVsd2vDAkgVze05lskxA6bQDhjTDFon5hvKmaoiFhlxsib3yQHrAdr8aQO126nS6rCOuiHBKRwJZB5agxqO2ZCTRnm7lK18MSKVjALBpHm3FIqDH77XwLeASAZDZD';

// SHA256 helper for Meta CAPI compliance
function hashSha256(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Meta Conversions API (CAPI) proxy endpoint
app.post('/api/meta-event', async (req, res) => {
  try {
    const {
      event_name,
      event_id,
      event_source_url,
      user_data = {},
      custom_data = {}
    } = req.body;

    if (!event_name) {
      return res.status(400).json({ error: 'event_name is required' });
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const clientUserAgent = req.headers['user-agent'] || '';

    // Prepare hashed user data according to Meta CAPI specification
    const payloadUserData: Record<string, any> = {
      client_ip_address: clientIp,
      client_user_agent: clientUserAgent
    };

    if (user_data.email) {
      payloadUserData.em = [hashSha256(user_data.email)];
    }
    if (user_data.fn) {
      payloadUserData.fn = [hashSha256(user_data.fn)];
    }
    if (user_data.ln) {
      payloadUserData.ln = [hashSha256(user_data.ln)];
    }
    if (user_data.ph) {
      payloadUserData.ph = [hashSha256(user_data.ph)];
    }
    if (user_data.fbp) {
      payloadUserData.fbp = user_data.fbp;
    }
    if (user_data.fbc) {
      payloadUserData.fbc = user_data.fbc;
    }

    const eventPayload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          event_source_url: event_source_url || req.headers.referer || '',
          action_source: 'website',
          user_data: payloadUserData,
          custom_data
        }
      ]
    };

    const capiUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;

    const response = await fetch(capiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Meta CAPI Error]', result);
      return res.status(response.status).json({ success: false, error: result });
    }

    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('[Meta CAPI Exception]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Mount Vite middleware in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(
          url,
          `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
    <title>Mel quebrou os dois ossos da patinha e precisa de uma cirurgia urgente. Sem sua ajuda, ela pode não sobreviver. 💔</title>
    <meta name="description" content="Mel é uma cachorrinha abandonada que sofreu uma grave fratura. Sem família para cuidar dela, sua doação é a única esperança para ela fazer a cirurgia e continuar vivendo." />
    <meta property="og:title" content="Mel quebrou os dois ossos da patinha e precisa de uma cirurgia urgente. Sem sua ajuda, ela pode não sobreviver. 💔" />
    <meta property="og:description" content="Mel é uma cachorrinha abandonada que sofreu uma grave fratura. Sem família para cuidar dela, sua doação é a única esperança para ela fazer a cirurgia e continuar vivendo." />
    <meta property="og:image" content="/assets/aistudio/mel_hero.png" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="Campanha Bem-Estar" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Campanha Bem-Estar - Ajude a Mel (Cachorrinha Resgatada)" />
    <meta name="twitter:description" content="Mel é uma cachorrinha abandonada que sofreu uma grave fratura. Sem família para cuidar dela, sua doação é a única esperança para ela fazer a cirurgia e continuar vivendo." />
    <meta name="twitter:image" content="/assets/aistudio/mel_hero.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
        );
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

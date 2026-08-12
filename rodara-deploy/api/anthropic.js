// Serverless proxy for the Anthropic API.
// Keeps the real API key on the server — the frontend never sees it.
// Deploy target: Vercel (or any host that supports Node serverless functions
// with this same request/response shape — Netlify Functions, Cloudflare
// Workers, etc. would need minor adaptation).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY. Set it in your hosting provider\'s environment variables.' });
    return;
  }

  // Basic abuse guard: this is meant for a small, controlled group of testers
  // during Phase 2, not a public launch. If ACCESS_CODE is set as an env var,
  // require the frontend to send it as a header.
  const requiredAccessCode = process.env.ACCESS_CODE;
  if (requiredAccessCode) {
    const providedCode = req.headers['x-access-code'];
    if (providedCode !== requiredAccessCode) {
      res.status(401).json({ error: 'Missing or incorrect access code.' });
      return;
    }
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Anthropic API: ' + err.message });
  }
}

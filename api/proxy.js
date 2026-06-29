// Vercel serverless proxy — adds CORS headers to AskBGP and BGP.tools APIs
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { source = 'askbgp', path: apiPath, ...rest } = req.query;

  const baseUrl = source === 'bgptools'
    ? 'https://bgp.tools'
    : 'https://d1o7trddq9o6qe.cloudfront.net';

  const qs = new URLSearchParams(rest).toString();
  const url = `${baseUrl}${apiPath}${qs ? '?' + qs : ''}`;

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'BGPIntelTool stieber@gmail.com - BGP Intelligence Dashboard' }
    });
    const text = await r.text();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

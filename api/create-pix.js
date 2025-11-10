export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      endpoint: '/api/create-pix',
      method: 'GET'
    });
  }

  if (req.method === 'POST') {
    return res.status(200).json({
      ok: true,
      endpoint: '/api/create-pix',
      method: 'POST'
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

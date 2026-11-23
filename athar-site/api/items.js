import { readData } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const data = await readData();
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not load items' });
  }
}

import { del } from '@vercel/blob';
import { authed, clean, readData, writeData, sleep } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not set in Vercel yet.' });
  }
  if (!authed(req)) {
    await sleep(800);
    return res.status(401).json({ error: 'Wrong password.' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (body.check) return res.status(200).json({ ok: true });
  try {
    const before = await readData();
    const data = clean(body);
    await writeData(data);
    // Remove photos that are no longer used by any item.
    const used = new Set(data.items.map((i) => i.img).filter(Boolean));
    const gone = before.items.map((i) => i.img).filter((u) => u && !used.has(u));
    if (gone.length) { try { await del(gone); } catch (e) { console.error(e); } }
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not save. Check that the Blob store is connected and set to Public.' });
  }
}

import { put } from '@vercel/blob';
import crypto from 'node:crypto';
import { authed, sleep } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authed(req)) {
    await sleep(800);
    return res.status(401).json({ error: 'Wrong password.' });
  }
  try {
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.image || ''));
    if (!m) return res.status(400).json({ error: 'Send a JPEG image.' });
    const buf = Buffer.from(m[1], 'base64');
    if (buf.length > 2_500_000) return res.status(413).json({ error: 'Image is too large.' });
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return res.status(400).json({ error: 'Not a valid JPEG.' });
    const blob = await put('items/' + crypto.randomUUID() + '.jpg', buf, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false
    });
    return res.status(200).json({ url: blob.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Upload failed. Check that the Blob store is connected and set to Public.' });
  }
}

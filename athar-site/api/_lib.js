import { put, list } from '@vercel/blob';
import crypto from 'node:crypto';

const FILE = 'athar-data.json';

export const SECTIONS = {
  accessories: ['bracelet', 'ring', 'earring'],
  perfumes: ['oriental', 'floral', 'woody', 'fresh']
};

export const emptyData = () => ({ whatsapp: '', currency: 'EGP', items: [] });

export async function readData() {
  const { blobs } = await list({ prefix: FILE, limit: 5 });
  const found = blobs.find((b) => b.pathname === FILE);
  if (!found) return emptyData();
  const r = await fetch(found.url + '?t=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) return emptyData();
  try {
    return clean(await r.json());
  } catch {
    return emptyData();
  }
}

export async function writeData(data) {
  await put(FILE, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  });
}

export function authed(req) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real) return false;
  const got = String(req.headers['x-admin-password'] || '');
  const a = crypto.createHash('sha256').update(real).digest();
  const b = crypto.createHash('sha256').update(got).digest();
  return crypto.timingSafeEqual(a, b);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const str = (v, max) => String(v ?? '').trim().slice(0, max);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
};

export function validImageUrl(u) {
  try {
    const url = new URL(String(u));
    return url.protocol === 'https:' && url.hostname.endsWith('.blob.vercel-storage.com') ? url.href : '';
  } catch {
    return '';
  }
}

export function clean(d) {
  d = d && typeof d === 'object' ? d : {};
  const items = (Array.isArray(d.items) ? d.items : []).slice(0, 500).map((i) => {
    const section = SECTIONS[i?.section] ? i.section : 'accessories';
    const cat = SECTIONS[section].includes(i?.cat) ? i.cat : SECTIONS[section][0];
    return {
      id: str(i?.id, 60) || crypto.randomUUID(),
      section,
      cat,
      name: str(i?.name, 120),
      desc: str(i?.desc, 400),
      price: num(i?.price),
      old: num(i?.old),
      tag: ['New', 'Sale'].includes(i?.tag) ? i.tag : '',
      soldOut: !!i?.soldOut,
      img: validImageUrl(i?.img),
      color: /^#[0-9a-f]{6}$/i.test(i?.color) ? i.color : '#c9a24a'
    };
  }).filter((i) => i.name);
  return {
    whatsapp: String(d.whatsapp ?? '').replace(/\D/g, '').slice(0, 20),
    currency: str(d.currency || 'EGP', 8) || 'EGP',
    items
  };
}

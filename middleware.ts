import { next } from '@vercel/functions';

const COOKIE_NAME = 'chordph_beta';
const PUBLIC_PATHS = [
  '/beta',
  '/api/beta/session',
  '/app/lib/supabase.js',
  '/icons/',
  '/sw.js',
  '/favicon.ico',
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path.endsWith('/') ? path : path + '/'));
}

function parseCookies(header: string | null) {
  const cookies: Record<string, string> = {};
  for (const part of (header || '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    cookies[part.slice(0, separator).trim()] = part.slice(separator + 1).trim();
  }
  return cookies;
}

function base64Url(bytes: ArrayBuffer) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function expectedSignature(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return base64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return mismatch === 0;
}

async function hasValidGateCookie(request: Request) {
  const secret = process.env.BETA_COOKIE_SECRET || '';
  if (secret.length < 32) return false;
  const raw = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!raw) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const [userId, expires, signature] = parts;
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !/^\d+$/.test(expires)) return false;
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  const expected = await expectedSignature(`${userId}.${expires}`, secret);
  return timingSafeEqual(signature, expected);
}

export const config = {
  matcher: '/((?!_vercel/).*)',
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);

  // Supabase already allows /app as an OAuth return URL. Move its one-time
  // callback to the public gate without ever exposing the app shell.
  if (url.pathname.startsWith('/app') && (url.searchParams.has('code') || url.searchParams.has('error'))) {
    const gate = new URL('/beta/', url);
    url.searchParams.forEach((value, key) => gate.searchParams.set(key, value));
    gate.searchParams.set('next', '/app/');
    return Response.redirect(gate, 307);
  }

  if (isPublicPath(url.pathname) || await hasValidGateCookie(request)) return next();

  const gate = new URL('/beta/', url);
  const returnTo = `${url.pathname}${url.search}`;
  if (returnTo.length < 1800) gate.searchParams.set('next', returnTo);
  return Response.redirect(gate, 307);
}

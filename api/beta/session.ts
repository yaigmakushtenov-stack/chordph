const SUPABASE_URL = 'https://icykdrauegbgkzcwwsvi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MVJjUxOe827PftmJlDiTsQ_RN0hLIII';
const COOKIE_NAME = 'chordph_beta';
const COOKIE_LIFETIME_SECONDS = 24 * 60 * 60;

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  });
}

function base64Url(bytes: ArrayBuffer) {
  return Buffer.from(bytes).toString('base64url');
}

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return base64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function DELETE() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
}

export async function POST(request: Request) {
  const secret = process.env.BETA_COOKIE_SECRET || '';
  if (secret.length < 32) return json({ error: 'gate_not_configured' }, 503);

  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return json({ error: 'sign_in_required' }, 401);

  const commonHeaders = { apikey: SUPABASE_KEY, Authorization: authorization };
  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: commonHeaders });
  if (!userResponse.ok) return json({ error: 'invalid_session' }, 401, { 'Set-Cookie': clearCookie() });
  const user = await userResponse.json();

  const accessResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_beta_access`, {
    method: 'POST',
    headers: { ...commonHeaders, 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!accessResponse.ok || await accessResponse.json() !== true) {
    return json({ error: 'invite_required' }, 403, { 'Set-Cookie': clearCookie() });
  }

  const expires = Math.floor(Date.now() / 1000) + COOKIE_LIFETIME_SECONDS;
  const value = `${user.id}.${expires}`;
  const signed = `${value}.${await signature(value, secret)}`;
  const cookie = `${COOKIE_NAME}=${signed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_LIFETIME_SECONDS}`;
  return json({ ok: true, expires_at: new Date(expires * 1000).toISOString() }, 200, { 'Set-Cookie': cookie });
}

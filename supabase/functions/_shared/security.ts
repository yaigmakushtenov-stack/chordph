const ALLOWED_ORIGINS = new Set([
  "https://chord.ph",
  "https://www.chord.ph",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);

function originHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || "";
  return {
    ...(ALLOWED_ORIGINS.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...originHeaders(req), "Content-Type": "application/json" },
  });
}

export function preflightResponse(req: Request): Response {
  const origin = req.headers.get("origin") || "";
  if (!ALLOWED_ORIGINS.has(origin)) return jsonResponse(req, { error: "origin_not_allowed" }, 403);
  return new Response(null, { status: 204, headers: originHeaders(req) });
}

export async function authorizeAndConsume(
  req: Request,
  feature: string,
  dailyLimit: number,
): Promise<{ userId: string } | Response> {
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse(req, { error: "origin_not_allowed" }, 403);
  }

  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return jsonResponse(req, { error: "sign_in_required" }, 401);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) return jsonResponse(req, { error: "service_unavailable" }, 503);

  const headers = { apikey: anonKey, authorization };
  const userResult = await fetch(`${url}/auth/v1/user`, { headers });
  if (!userResult.ok) return jsonResponse(req, { error: "sign_in_required" }, 401);
  const user = await userResult.json();
  if (!user?.id) return jsonResponse(req, { error: "sign_in_required" }, 401);

  const quotaResult = await fetch(`${url}/rest/v1/rpc/consume_ai_quota`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ p_feature: feature, p_daily_limit: dailyLimit }),
  });
  if (!quotaResult.ok) return jsonResponse(req, { error: "service_unavailable" }, 503);
  const allowed = await quotaResult.json();
  if (allowed !== true) return jsonResponse(req, { error: "daily_limit_reached" }, 429);
  return { userId: user.id };
}

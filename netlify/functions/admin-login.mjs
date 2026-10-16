import { checkLogin, configured, issueCookie, clearCookie, session, json } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method === "GET") {
    const s = session(req);
    return json({ loggedIn: !!s, email: s?.e || null, missing: configured() });
  }
  if (req.method === "DELETE") return json({ ok: true }, 200, { "set-cookie": clearCookie() });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const missing = configured();
  if (missing.length) return json({ error: "not_configured", missing }, 503);

  let body = {};
  try { body = await req.json(); } catch {}
  if (!checkLogin(body.email, body.password)) {
    await new Promise((r) => setTimeout(r, 800)); // 무차별 대입 속도 늦추기
    return json({ error: "invalid" }, 401);
  }
  const email = String(body.email).trim().toLowerCase();
  return json({ ok: true, email }, 200, { "set-cookie": issueCookie(email) });
};

export const config = { path: "/api/admin/session" };

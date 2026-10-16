import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const COOKIE = "mx_admin";
const MAX_AGE = 60 * 60 * 8; // 8시간

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? "").trim();

export function configured() {
  const missing = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "SESSION_SECRET", "NETLIFY_API_TOKEN"].filter((k) => !env(k));
  return missing;
}

const same = (a, b) =>
  timingSafeEqual(createHash("sha256").update(String(a)).digest(), createHash("sha256").update(String(b)).digest());

export function checkLogin(email, password) {
  const ok = same(String(email || "").trim().toLowerCase(), env("ADMIN_EMAIL").toLowerCase());
  return same(password || "", env("ADMIN_PASSWORD")) && ok;
}

const sign = (body) => createHmac("sha256", env("SESSION_SECRET")).update(body).digest("base64url");

export function issueCookie(email) {
  const body = Buffer.from(JSON.stringify({ e: email, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${COOKIE}=${body}.${sign(body)}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function session(req) {
  const raw = (req.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const [body, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!body || !sig || !same(sig, sign(body))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

export const apiToken = () => env("NETLIFY_API_TOKEN");

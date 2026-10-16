import { session, json, apiToken } from "../lib/auth.mjs";

const FORM = "franchise-inquiry";
const API = "https://api.netlify.com/api/v1";

async function nf(path, init = {}) {
  const res = await fetch(API + path, { ...init, headers: { authorization: `Bearer ${apiToken()}`, ...init.headers } });
  if (!res.ok) throw new Error(`Netlify API ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export default async (req, context) => {
  if (!session(req)) return json({ error: "unauthorized" }, 401);
  const siteId = context.site?.id || process.env.SITE_ID;

  try {
    if (req.method === "DELETE") {
      const id = new URL(req.url).searchParams.get("id");
      if (!id || !/^[a-f0-9]{24}$/i.test(id)) return json({ error: "bad_id" }, 400);
      const sub = await nf(`/submissions/${id}`);
      if (sub.site_id !== siteId) return json({ error: "forbidden" }, 403);
      await nf(`/submissions/${id}`, { method: "DELETE" });
      return json({ ok: true });
    }
    if (req.method !== "GET") return json({ error: "method" }, 405);

    const forms = await nf(`/sites/${siteId}/forms`);
    const form = forms.find((f) => f.name === FORM);
    if (!form) return json({ items: [], note: "form_not_found" });

    const items = [];
    for (let page = 1; page <= 20; page++) {
      const batch = await nf(`/forms/${form.id}/submissions?per_page=100&page=${page}`);
      items.push(...batch);
      if (batch.length < 100) break;
    }
    return json({
      items: items.map((s) => ({ id: s.id, number: s.number, created_at: s.created_at, data: s.data || {} })),
    });
  } catch (e) {
    return json({ error: "upstream", detail: String(e.message || e) }, 502);
  }
};

export const config = { path: "/api/admin/submissions" };

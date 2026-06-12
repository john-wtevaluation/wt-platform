// pages/api/state.js — reads and writes the firm's data to Neon Postgres.
// Auth: requests must include header x-wt-key matching the APP_PASSWORD env var.
import { neon } from "@neondatabase/serverless";

export const config = { api: { bodyParser: { sizeLimit: "2mb" } } };

export default async function handler(req, res) {
  if (req.headers["x-wt-key"] !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const sql = neon(process.env.DATABASE_URL);
  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT data, updated_at FROM app_state WHERE id = 1`;
      return res.status(200).json(rows[0] ? { data: rows[0].data, updatedAt: rows[0].updated_at } : { data: null });
    }
    if (req.method === "PUT") {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      await sql`
        INSERT INTO app_state (id, data, updated_at)
        VALUES (1, ${body}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
      `;
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

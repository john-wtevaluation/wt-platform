// pages/api/setup.js — one-time database setup.
// Visit https://YOUR-APP.vercel.app/api/setup?key=YOUR_PASSWORD once after deploy.
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.query.key !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    return res.status(200).json({ ok: true, message: "Database ready. You can close this tab and open the app." });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

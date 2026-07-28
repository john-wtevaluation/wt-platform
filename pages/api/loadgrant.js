// pages/api/loadgrant.js — one-time import of the GCYSPC Year 1 grant calendar.
//
// Step 1 (backup):  /api/loadgrant?key=YOUR_PASSWORD
//                   Returns the current projects and tasks. Save this before step 2.
// Step 2 (apply):   /api/loadgrant?key=YOUR_PASSWORD&confirm=yes
//                   Replaces projects and tasks only. Invoices, opportunities,
//                   time entries, and expenses are left untouched.
//
// Safe to re-run: it always rebuilds from lib/gcyspc.js rather than appending.
import { neon } from "@neondatabase/serverless";
import { grantProjects, gcyspcTasks } from "../../lib/gcyspc";

export default async function handler(req, res) {
  if (req.query.key !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const rows = await sql`SELECT data FROM app_state WHERE id = 1`;
    const current = rows[0]?.data || null;

    if (!current) {
      return res.status(404).json({
        error: "No app_state row found. Open the app once so it seeds, then re-run this."
      });
    }

    const backup = { projects: current.projects || [], tasks: current.tasks || [] };

    if (req.query.confirm !== "yes") {
      return res.status(200).json({
        mode: "preview",
        message:
          "Nothing changed. Copy the backup below, then re-run this URL with &confirm=yes to apply.",
        willReplace: {
          projects: backup.projects.length + " \u2192 " + grantProjects().length,
          tasks: backup.tasks.length + " \u2192 " + gcyspcTasks().length
        },
        preserved: ["invoices", "opportunities", "time", "expenses"],
        backup
      });
    }

    const next = {
      ...current,
      projects: grantProjects(),
      tasks: gcyspcTasks()
    };

    await sql`
      INSERT INTO app_state (id, data, updated_at)
      VALUES (1, ${JSON.stringify(next)}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;

    return res.status(200).json({
      ok: true,
      mode: "applied",
      projects: next.projects.length,
      tasks: next.tasks.length,
      preserved: {
        invoices: (current.invoices || []).length,
        opportunities: (current.opportunities || []).length,
        time: (current.time || []).length,
        expenses: (current.expenses || []).length
      },
      backup,
      message: "Grant calendar loaded. Reload the app on your phone to see it."
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

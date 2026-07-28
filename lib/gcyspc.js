// lib/gcyspc.js — GCYSPC DFC Year 1 grant calendar.
// Source: GCYSPC Project Narrative + Year 1 Evaluation Plan working document.
// Dates for the performance year (Oct 1 2026 - Sep 30 2027) are INFERRED from the
// quarterly close schedule and are not confirmed by a Notice of Award. Task ADM-02
// exists to confirm them. Adjust here, re-run /api/loadgrant, and everything updates.

const uid = () => Math.random().toString(36).slice(2, 10);

export const GCYSPC_PROJECT_ID = "p-gcyspc-y1";

// [code, due, owner, title, priority]
const ROWS = [
  ["ADM-01", "2026-10-31", "RAPC PD + W&T", "Execute the external evaluation contract and scope of work with W&T Evaluation", "Critical"],
  ["ADM-02", "2026-10-31", "RAPC PD", "Confirm Notice of Award start date, federal progress report deadlines, and the DFC cross-site data collection window", "Critical"],
  ["RL-01", "2026-10-31", "Coalition Coord", "Monthly implementation log entry: service counts, activity tracking, partner sector roster", "Medium"],

  ["EV-01", "2026-11-30", "W&T", "Design digital templates for youth surveys, parent surveys, and implementation tracking sheets", "High"],
  ["EV-17", "2026-11-30", "W&T", "Build the coalition capacity and participation tracking tool used to verify the minimum 12 required sectors", "High"],
  ["RL-02", "2026-11-30", "Coalition Coord", "Monthly implementation log entry", "Medium"],

  ["EV-02", "2026-12-31", "W&T + RAPC PD", "Establish the Data Management Plan: secure storage, role-based access, data dictionary, confidentiality, archiving", "High"],
  ["RL-03", "2026-12-31", "Coalition Coord", "Monthly implementation log entry", "Medium"],
  ["RQ-1", "2026-12-31", "Coalition Coord", "Quarter 1 close: transmit clean log files to the evaluator", "High"],

  ["RD-1", "2027-01-21", "W&T", "Quarter 1 Tableau dashboard update (15 business days after Q1 close)", "High"],
  ["ADM-03", "2027-01-31", "RAPC PD", "Establish data sharing agreements with school district, juvenile justice, and healthcare partners", "High"],
  ["EV-03", "2027-01-31", "RAPC staff", "Coordinate with Greene County School District: parental permissions, survey dates, field administration plan", "High"],
  ["RL-04", "2027-01-31", "Coalition Coord", "Monthly implementation log entry", "Medium"],
  ["RR-1", "2027-01-31", "Coalition Leaders", "Quarterly review of dashboard metrics, with documented adjustments", "Medium"],

  ["RL-05", "2027-02-28", "Coalition Coord", "Monthly implementation log entry", "Medium"],

  ["EV-04", "2027-03-31", "RAPC staff/Schools", "Administer baseline standardized youth survey, at least three grade levels between grades 6 and 12", "Critical"],
  ["RL-06", "2027-03-31", "Coalition Coord", "Monthly implementation log entry", "Medium"],
  ["RQ-2", "2027-03-31", "Coalition Coord", "Quarter 2 close: transmit clean log files to the evaluator", "High"],
  ["RV-1", "2027-03-31", "Coalition Leaders", "Month 6 review of coalition progress; adjust roles or strategies based on participation data", "Medium"],

  ["RD-2", "2027-04-21", "W&T", "Quarter 2 Tableau dashboard update (15 business days after Q2 close)", "High"],
  ["EV-05", "2027-04-30", "W&T", "Clean, aggregate, and format the biennial DFC core measure dataset for federal reporting", "Critical"],
  ["RL-07", "2027-04-30", "Coalition Coord", "Monthly implementation log entry", "Medium"],
  ["RR-2", "2027-04-30", "Coalition Leaders", "Quarterly review of dashboard metrics, with documented adjustments", "Medium"],

  ["RL-08", "2027-05-31", "Coalition Coord", "Monthly implementation log entry", "Medium"],

  ["RL-09", "2027-06-30", "Coalition Coord", "Monthly implementation log entry", "Medium"],
  ["RQ-3", "2027-06-30", "Coalition Coord", "Quarter 3 close: transmit clean log files to the evaluator", "High"],

  ["RD-3", "2027-07-21", "W&T", "Quarter 3 Tableau dashboard update (15 business days after Q3 close)", "High"],
  ["EV-06", "2027-07-31", "RAPC staff", "Distribute parent and caregiver surveys via digital links at community outreach forums", "Medium"],
  ["RL-10", "2027-07-31", "Coalition Coord", "Monthly implementation log entry", "Medium"],
  ["RR-3", "2027-07-31", "Coalition Leaders", "Quarterly review of dashboard metrics, with documented adjustments", "Medium"],

  ["EV-10", "2027-08-31", "Sector Leads", "Extract and transmit aggregate institutional records: school suspension counts, juvenile court logs", "Medium"],
  ["EV-11", "2027-08-31", "W&T + Youth Coord", "Convene Youth Advisory Group for qualitative context on adolescent data patterns", "Medium"],
  ["RL-11", "2027-08-31", "Coalition Coord", "Monthly implementation log entry", "Medium"],

  ["EV-12", "2027-09-30", "W&T", "Author the year-end compliance evaluation summary report and technical data appendices", "Critical"],
  ["EV-13", "2027-09-30", "W&T + Comms Team", "Produce digital-first dissemination products: community summaries, dashboard, infographics, youth summaries", "High"],
  ["EV-14", "2027-09-30", "RAPC PD + W&T", "Confirm DFC National Cross-Site reporting window and submit required core measures", "Critical"],
  ["EV-18", "2027-09-30", "W&T", "Annual trend analysis on parent survey and institutional context data", "Medium"],
  ["EV-19", "2027-09-30", "RAPC PD + W&T", "Assemble evaluation contribution to federal progress reports (PLACEHOLDER, dates unconfirmed)", "Medium"],
  ["RL-12", "2027-09-30", "Coalition Coord", "Monthly implementation log entry", "Medium"],
  ["RQ-4", "2027-09-30", "Coalition Coord", "Quarter 4 close: transmit clean log files to the evaluator", "High"],
  ["RR-4", "2027-09-30", "Coalition Leaders", "Quarterly review of dashboard metrics, with documented adjustments", "Medium"],
  ["RV-2", "2027-09-30", "Coalition Leaders", "Month 12 review of coalition progress; adjust roles or strategies", "Medium"],

  ["RD-4", "2027-10-21", "W&T", "Quarter 4 Tableau dashboard update (15 business days after Q4 close)", "High"]
];

// W&T-owned deliverables, surfaced as milestones so the dashboard shows "next due".
const MILESTONES = [
  ["Contract executed and scope confirmed", "2026-10-31"],
  ["Instruments and sector tracking tool designed", "2026-11-30"],
  ["Data Management Plan established", "2026-12-31"],
  ["Q1 dashboard update", "2027-01-21"],
  ["Q2 dashboard update", "2027-04-21"],
  ["DFC core measure dataset formatted", "2027-04-30"],
  ["Q3 dashboard update", "2027-07-21"],
  ["Year-end evaluation report and appendices", "2027-09-30"],
  ["Dissemination products delivered", "2027-09-30"],
  ["Cross-site core measures submitted", "2027-09-30"],
  ["Q4 dashboard update", "2027-10-21"]
];

export function gcyspcProject() {
  return {
    id: GCYSPC_PROJECT_ID,
    name: "GCYSPC DFC Evaluation (Year 1)",
    org: "Greene County Youth Substance Prevention Coalition (via RAPC)",
    value: 15000,
    status: "Active",
    start: "2026-10-01",
    end: "2027-09-30",
    securing: "John",
    milestones: MILESTONES.map(([name, due]) => ({ id: uid(), name, due, pct: 0 }))
  };
}

export function gcyspcTasks() {
  return ROWS.map(([code, due, assignee, title, priority]) => ({
    id: uid(),
    projectId: GCYSPC_PROJECT_ID,
    title: code + " \u00b7 " + title,
    assignee,
    due,
    priority,
    status: "Not Started"
  }));
}

// RAPC contract ran Aug 1 2025 - Jul 21 2026. Kept as a closed project so the four
// RAPC invoices stay linked and the commission ledger keeps working. No open dates.
export function rapcArchivedProject() {
  return {
    id: "p-rapc",
    name: "RAPC Independent Evaluation (closed)",
    org: "Rural Alabama Prevention Center",
    value: 10000,
    status: "Completed",
    start: "2025-08-01",
    end: "2026-07-21",
    securing: "John",
    milestones: []
  };
}

export function grantProjects() {
  return [gcyspcProject(), rapcArchivedProject()];
}

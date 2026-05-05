import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';

// ─── Required fields (mirrors the FastAPI backend and the AIAnalysisPayload type) ─

const REQUIRED_FIELDS = [
  'respondentName',
  'respondentGroup',
  'organizationDepartment',
  'careerInterests',
  'enjoyedSkills',
  'workEnvironment',
  'primaryMotivation',
  'biggestStrength',
  'shortTermGoal',
  'longTermGoal',
] as const;

const VALID_GROUPS = new Set(['IT_STUDENT', 'NYSC_CORP_MEMBER']);

/** Maximum accepted request body size (64 KB). */
const MAX_PAYLOAD_BYTES = 65_536;

// ─── Table initialisation ─────────────────────────────────────────────────────
// CREATE TABLE IF NOT EXISTS is idempotent; running it on every cold-start
// ensures the schema exists without needing a separate migration step.

async function ensureTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS assessments (
      id                       TEXT        PRIMARY KEY,
      submitted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      respondent_name          TEXT        NOT NULL,
      respondent_group         TEXT        NOT NULL,
      organization_department  TEXT        NOT NULL,
      school_program           TEXT,
      expected_completion_date TEXT,
      program_studied          TEXT,
      degree_required          TEXT,
      service_end_date         TEXT,
      career_interests         JSONB       NOT NULL DEFAULT '[]',
      enjoyed_skills           JSONB       NOT NULL DEFAULT '[]',
      work_environment         TEXT        NOT NULL,
      primary_motivation       TEXT        NOT NULL,
      biggest_strength         TEXT        NOT NULL,
      short_term_goal          TEXT        NOT NULL,
      long_term_goal           TEXT        NOT NULL,
      scenario_responses       JSONB       NOT NULL DEFAULT '{}'
    )
  `;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePayload(payload: Record<string, unknown>): string | null {
  for (const field of REQUIRED_FIELDS) {
    const value = payload[field];
    if (value === undefined || value === null || value === '') {
      return `Missing required field: ${field}`;
    }
  }
  if (!VALID_GROUPS.has(String(payload.respondentGroup))) {
    return 'Invalid respondentGroup value.';
  }
  return null;
}

// ─── Google Sheets forwarding ─────────────────────────────────────────────────
// Set GOOGLE_SHEETS_WEBHOOK_URL to the Apps Script Web App deployment URL.
// Set GOOGLE_SHEETS_SECRET to a shared secret (must match the Apps Script
// Script Property named SHARED_SECRET) for lightweight endpoint protection.

async function forwardToGoogleSheets(body: Record<string, unknown>): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('GOOGLE_SHEETS_WEBHOOK_URL not configured');

  const sheetsBody: Record<string, unknown> = { ...body };
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (secret) sheetsBody._secret = secret;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sheetsBody),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Sheets webhook returned HTTP ${response.status}`);
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  // Payload size guard
  const rawBodySize = Buffer.byteLength(JSON.stringify(req.body ?? {}), 'utf8');
  if (rawBodySize > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({ detail: 'Payload too large.' });
  }

  const payload = req.body as Record<string, unknown>;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ detail: 'Invalid JSON payload.' });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return res.status(400).json({ detail: validationError });
  }

  const id = randomUUID();
  const submittedAt = new Date().toISOString();

  // Normalise list and object fields
  const careerInterests = Array.isArray(payload.careerInterests) ? payload.careerInterests : [];
  const enjoyedSkills = Array.isArray(payload.enjoyedSkills) ? payload.enjoyedSkills : [];
  const scenarioResponses =
    typeof payload.scenarioResponses === 'object' &&
    payload.scenarioResponses !== null &&
    !Array.isArray(payload.scenarioResponses)
      ? payload.scenarioResponses
      : {};

  // Optional string fields (only present for one respondent group)
  const schoolProgram = payload.schoolProgram ? String(payload.schoolProgram) : null;
  const expectedCompletionDate = payload.expectedCompletionDate
    ? String(payload.expectedCompletionDate)
    : null;
  const programStudied = payload.programStudied ? String(payload.programStudied) : null;
  const degreeRequired = payload.degreeRequired ? String(payload.degreeRequired) : null;
  const serviceEndDate = payload.serviceEndDate ? String(payload.serviceEndDate) : null;

  // Sanitized flat payload shared with the Google Sheets forwarder
  const sanitizedPayload: Record<string, unknown> = {
    respondentName: String(payload.respondentName),
    respondentGroup: String(payload.respondentGroup),
    organizationDepartment: String(payload.organizationDepartment),
    schoolProgram,
    expectedCompletionDate,
    programStudied,
    degreeRequired,
    serviceEndDate,
    careerInterests,
    enjoyedSkills,
    workEnvironment: String(payload.workEnvironment),
    primaryMotivation: String(payload.primaryMotivation),
    biggestStrength: String(payload.biggestStrength),
    shortTermGoal: String(payload.shortTermGoal),
    longTermGoal: String(payload.longTermGoal),
    scenarioResponses,
  };

  // ── Attempt storage backends in parallel ──────────────────────────────────
  // Only configured backends are included; the response succeeds if at least
  // one of them stores the data.

  const hasPostgres = !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);
  const hasSheetsWebhook = !!process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  interface StorageTask { backend: 'postgres' | 'sheets'; task: Promise<void> }
  const tasks: StorageTask[] = [];

  if (hasPostgres) {
    tasks.push({
      backend: 'postgres',
      task: (async () => {
        await ensureTable();
        await sql`
          INSERT INTO assessments (
            id, submitted_at, respondent_name, respondent_group, organization_department,
            school_program, expected_completion_date, program_studied, degree_required,
            service_end_date, career_interests, enjoyed_skills, work_environment,
            primary_motivation, biggest_strength, short_term_goal, long_term_goal,
            scenario_responses
          ) VALUES (
            ${id},
            ${submittedAt}::timestamptz,
            ${String(payload.respondentName)},
            ${String(payload.respondentGroup)},
            ${String(payload.organizationDepartment)},
            ${schoolProgram},
            ${expectedCompletionDate},
            ${programStudied},
            ${degreeRequired},
            ${serviceEndDate},
            ${JSON.stringify(careerInterests)}::jsonb,
            ${JSON.stringify(enjoyedSkills)}::jsonb,
            ${String(payload.workEnvironment)},
            ${String(payload.primaryMotivation)},
            ${String(payload.biggestStrength)},
            ${String(payload.shortTermGoal)},
            ${String(payload.longTermGoal)},
            ${JSON.stringify(scenarioResponses)}::jsonb
          )
        `;
      })(),
    });
  }

  if (hasSheetsWebhook) {
    tasks.push({ backend: 'sheets', task: forwardToGoogleSheets(sanitizedPayload) });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.task));
  let anySucceeded = false;
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      anySucceeded = true;
    } else if (tasks[i].backend === 'postgres') {
      console.error('[postgres] Failed to insert assessment:', result.reason);
    } else {
      console.warn('[sheets] Forwarding failed (non-fatal):', result.reason);
    }
  });

  // Return 500 only if at least one backend was configured and all failed
  if (tasks.length > 0 && !anySucceeded) {
    return res.status(500).json({ detail: 'Failed to store assessment. Please try again.' });
  }

  return res.status(201).json({ id, submittedAt });
}

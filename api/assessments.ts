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

// ─── One-time table initialisation ───────────────────────────────────────────
// CREATE TABLE IF NOT EXISTS is idempotent, so we only need to run it once per
// cold-start (module-level flag avoids the round-trip on warm invocations).

let tableReady = false;

async function ensureTable(): Promise<void> {
  if (tableReady) return;
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
  tableReady = true;
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

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
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

  try {
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

    return res.status(201).json({ id, submittedAt });
  } catch (err) {
    console.error('Failed to insert assessment:', err);
    return res.status(500).json({ detail: 'Failed to store assessment. Please try again.' });
  }
}

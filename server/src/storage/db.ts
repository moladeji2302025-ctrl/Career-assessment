import * as fs from 'fs';
import * as path from 'path';

// ─── Data model ───────────────────────────────────────────────────────────────

export type GroupType = 'IT_STUDENT' | 'NYSC_CORP_MEMBER';

/** A single stored assessment response with server-assigned metadata. */
export interface StoredAssessment {
  /** UUID assigned at submission time */
  id: string;
  /** ISO-8601 timestamp of submission */
  submittedAt: string;

  // ── Identity ──────────────────────────────────────────────────────────────
  respondentName: string;
  respondentGroup: GroupType;
  organizationDepartment: string;

  // ── IT Student (present when respondentGroup === 'IT_STUDENT') ────────────
  schoolProgram?: string;
  expectedCompletionDate?: string;

  // ── NYSC Corp Member (present when respondentGroup === 'NYSC_CORP_MEMBER') ─
  programStudied?: string;
  degreeRequired?: string;
  serviceEndDate?: string;

  // ── Interests & skills ────────────────────────────────────────────────────
  careerInterests: string[];
  enjoyedSkills: string[];
  workEnvironment: string;
  primaryMotivation: string;
  biggestStrength: string;
  shortTermGoal: string;
  longTermGoal: string;
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

const DATA_FILE = path.join(__dirname, '../../data/assessments.json');

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

export function readAll(): StoredAssessment[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw) as StoredAssessment[];
}

export function append(entry: StoredAssessment): void {
  const all = readAll();
  all.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), 'utf8');
}

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readAll, append, StoredAssessment, GroupType } from '../storage/db';

const router = Router();

// ─── POST /api/assessments ────────────────────────────────────────────────────

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;

  // Basic required-field validation
  const requiredFields: (keyof StoredAssessment)[] = [
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
  ];

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }

  const validGroups: GroupType[] = ['IT_STUDENT', 'NYSC_CORP_MEMBER'];
  if (!validGroups.includes(body.respondentGroup as GroupType)) {
    res.status(400).json({ error: 'Invalid respondentGroup value.' });
    return;
  }

  const entry: StoredAssessment = {
    id: uuidv4(),
    submittedAt: new Date().toISOString(),
    respondentName: String(body.respondentName),
    respondentGroup: body.respondentGroup as GroupType,
    organizationDepartment: String(body.organizationDepartment),
    // IT student fields
    schoolProgram: body.schoolProgram ? String(body.schoolProgram) : undefined,
    expectedCompletionDate: body.expectedCompletionDate
      ? String(body.expectedCompletionDate)
      : undefined,
    // NYSC fields
    programStudied: body.programStudied ? String(body.programStudied) : undefined,
    degreeRequired: body.degreeRequired ? String(body.degreeRequired) : undefined,
    serviceEndDate: body.serviceEndDate ? String(body.serviceEndDate) : undefined,
    // Interests & skills
    careerInterests: Array.isArray(body.careerInterests)
      ? (body.careerInterests as string[])
      : [],
    enjoyedSkills: Array.isArray(body.enjoyedSkills)
      ? (body.enjoyedSkills as string[])
      : [],
    workEnvironment: String(body.workEnvironment),
    primaryMotivation: String(body.primaryMotivation),
    biggestStrength: String(body.biggestStrength),
    shortTermGoal: String(body.shortTermGoal),
    longTermGoal: String(body.longTermGoal),
  };

  append(entry);

  res.status(201).json({ id: entry.id, submittedAt: entry.submittedAt });
});

// ─── GET /api/assessments ─────────────────────────────────────────────────────

router.get('/', (_req: Request, res: Response) => {
  const all = readAll();
  res.json(all);
});

export default router;

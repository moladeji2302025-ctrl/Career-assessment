// ─── Group types ─────────────────────────────────────────────────────────────

export type GroupType = 'IT_STUDENT' | 'NYSC_CORP_MEMBER';

// ─── Common fields ────────────────────────────────────────────────────────────

export interface CommonFields {
  /** Which department inside the organisation this person was posted to */
  organizationDepartment: string;
}

// ─── IT-Student–specific fields ──────────────────────────────────────────────

export interface ITStudentFields {
  /** Academic programme / department currently enrolled in */
  schoolProgram: string;
  /** Expected date of programme completion (ISO date string YYYY-MM-DD) */
  expectedCompletionDate: string;
}

// ─── NYSC-Corp-member–specific fields ────────────────────────────────────────

export interface NYSCCorpMemberFields {
  /** Programme studied at university */
  programStudied: string;
  /**
   * Degree qualification derived automatically from programStudied.
   * This field is read-only / auto-filled and is not entered by the user.
   */
  degreeRequired: string;
  /** Date on which NYSC service ends (ISO date string YYYY-MM-DD) */
  serviceEndDate: string;
}

// ─── Subtle / interests & skills section ─────────────────────────────────────

export interface InterestsAndSkillsFields {
  /** Primary career interest areas (at least one required) */
  careerInterests: string[];
  /** Skills the respondent enjoys using */
  enjoyedSkills: string[];
  /** Preferred work environment */
  workEnvironment: string;
  /** What motivates them most */
  primaryMotivation: string;
  /** Their self-identified biggest strength */
  biggestStrength: string;
  /** Short-term career goal (1-2 years) */
  shortTermGoal: string;
  /** Long-term career vision (5+ years) */
  longTermGoal: string;
}

// ─── Consolidated form data model ────────────────────────────────────────────

export interface AssessmentFormData {
  group: GroupType;
  common: CommonFields;
  itStudent?: ITStudentFields;
  nyscCorpMember?: NYSCCorpMemberFields;
  interestsAndSkills: InterestsAndSkillsFields;
}

// ─── AI payload ──────────────────────────────────────────────────────────────

/**
 * The structured payload that is sent to the AI analysis model.
 * Keep this flat and descriptive so the model can use it directly.
 */
export interface AIAnalysisPayload {
  respondentGroup: GroupType;
  organizationDepartment: string;

  // IT student
  schoolProgram?: string;
  expectedCompletionDate?: string;

  // NYSC corp member
  programStudied?: string;
  degreeRequired?: string;
  serviceEndDate?: string;

  // Interests & skills
  careerInterests: string[];
  enjoyedSkills: string[];
  workEnvironment: string;
  primaryMotivation: string;
  biggestStrength: string;
  shortTermGoal: string;
  longTermGoal: string;
}

// ─── Validation errors ────────────────────────────────────────────────────────

export type ValidationErrors = Partial<
  Record<
    | keyof CommonFields
    | keyof ITStudentFields
    | keyof NYSCCorpMemberFields
    | keyof InterestsAndSkillsFields
    | 'group',
    string
  >
>;

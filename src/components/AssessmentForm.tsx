import { useState, useCallback } from 'react';
import type {
  GroupType,
  AssessmentFormData,
  CommonFields,
  ITStudentFields,
  NYSCCorpMemberFields,
  InterestsAndSkillsFields,
  ValidationErrors,
  AIAnalysisPayload,
} from '../types/assessment';

import Welcome from './steps/Welcome';
import GroupSelection from './steps/GroupSelection';
import BasicInfo from './steps/BasicInfo';
import SubtleQuestions from './steps/SubtleQuestions';
import Review from './steps/Review';

// ─── Initial state helpers ────────────────────────────────────────────────────

const EMPTY_COMMON: CommonFields = { organizationDepartment: '' };

const EMPTY_IT: ITStudentFields = {
  schoolProgram: '',
  expectedCompletionDate: '',
};

const EMPTY_NYSC: NYSCCorpMemberFields = {
  programStudied: '',
  degreeRequired: '',
  serviceEndDate: '',
};

const EMPTY_INTERESTS: InterestsAndSkillsFields = {
  careerInterests: [],
  enjoyedSkills: [],
  workEnvironment: '',
  primaryMotivation: '',
  biggestStrength: '',
  shortTermGoal: '',
  longTermGoal: '',
};

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Group' },
  { id: 3, label: 'Basic Info' },
  { id: 4, label: 'Interests' },
  { id: 5, label: 'Review' },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(
  step: number,
  respondentName: string,
  group: GroupType | '',
  common: CommonFields,
  itStudent: ITStudentFields,
  nyscCorpMember: NYSCCorpMemberFields,
  interests: InterestsAndSkillsFields,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (step === 1) {
    if (!respondentName.trim())
      errors.respondentName = 'Please enter your name to continue.';
  }

  if (step === 2) {
    if (!group) errors.group = 'Please select which group you belong to.';
  }

  if (step === 3) {
    if (!common.organizationDepartment)
      errors.organizationDepartment = 'Please select the department you were posted to.';

    if (group === 'IT_STUDENT') {
      if (!itStudent.schoolProgram.trim())
        errors.schoolProgram = 'Please enter your programme or department.';
      if (!itStudent.expectedCompletionDate)
        errors.expectedCompletionDate = 'Please select your expected completion date.';
    }

    if (group === 'NYSC_CORP_MEMBER') {
      if (!nyscCorpMember.programStudied.trim())
        errors.programStudied = 'Please enter the programme you studied.';
      if (!nyscCorpMember.degreeRequired.trim())
        errors.degreeRequired =
          'Degree could not be determined automatically. Please enter it manually.';
      if (!nyscCorpMember.serviceEndDate)
        errors.serviceEndDate = 'Please select your service end date.';
    }
  }

  if (step === 4) {
    if (interests.careerInterests.length === 0)
      errors.careerInterests = 'Please select at least one career interest.';
    if (interests.enjoyedSkills.length === 0)
      errors.enjoyedSkills = 'Please select at least one skill you enjoy.';
    if (!interests.workEnvironment)
      errors.workEnvironment = 'Please choose your preferred work environment.';
    if (!interests.primaryMotivation)
      errors.primaryMotivation = 'Please select what motivates you most.';
    if (!interests.biggestStrength)
      errors.biggestStrength = 'Please select your biggest strength.';
    if (!interests.shortTermGoal.trim())
      errors.shortTermGoal = 'Please describe your short-term goal.';
    if (!interests.longTermGoal.trim())
      errors.longTermGoal = 'Please describe your long-term goal.';
  }

  return errors;
}

// ─── Payload builder ──────────────────────────────────────────────────────────

function buildAIPayload(formData: AssessmentFormData): AIAnalysisPayload {
  const { respondentName, group, common, itStudent, nyscCorpMember, interestsAndSkills } = formData;
  const payload: AIAnalysisPayload = {
    respondentName,
    respondentGroup: group,
    organizationDepartment: common.organizationDepartment,
    ...interestsAndSkills,
  };

  if (group === 'IT_STUDENT' && itStudent) {
    payload.schoolProgram = itStudent.schoolProgram;
    payload.expectedCompletionDate = itStudent.expectedCompletionDate;
  }

  if (group === 'NYSC_CORP_MEMBER' && nyscCorpMember) {
    payload.programStudied = nyscCorpMember.programStudied;
    payload.degreeRequired = nyscCorpMember.degreeRequired;
    payload.serviceEndDate = nyscCorpMember.serviceEndDate;
  }

  return payload;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssessmentForm() {
  const [step, setStep] = useState(1);
  const [respondentName, setRespondentName] = useState('');
  const [group, setGroup] = useState<GroupType | ''>('');
  const [common, setCommon] = useState<CommonFields>(EMPTY_COMMON);
  const [itStudent, setITStudent] = useState<ITStudentFields>(EMPTY_IT);
  const [nyscCorpMember, setNYSCCorpMember] = useState<NYSCCorpMemberFields>(EMPTY_NYSC);
  const [interests, setInterests] = useState<InterestsAndSkillsFields>(EMPTY_INTERESTS);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedPayload, setSubmittedPayload] = useState<AIAnalysisPayload | null>(null);

  // ── Field change handlers ─────────────────────────────────────────────────

  const handleCommonChange = useCallback(
    (field: keyof CommonFields, value: string) => {
      setCommon((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleITChange = useCallback(
    (field: keyof ITStudentFields, value: string) => {
      setITStudent((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleNYSCChange = useCallback(
    (field: keyof NYSCCorpMemberFields, value: string) => {
      setNYSCCorpMember((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleInterestsChange = useCallback(
    (field: keyof InterestsAndSkillsFields, value: string | string[]) => {
      setInterests((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext = () => {
    const stepErrors = validateStep(
      step,
      respondentName,
      group,
      common,
      itStudent,
      nyscCorpMember,
      interests,
    );
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  // ── Submission ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!group) return;

    const formData: AssessmentFormData = {
      respondentName,
      group,
      common,
      itStudent: group === 'IT_STUDENT' ? itStudent : undefined,
      nyscCorpMember: group === 'NYSC_CORP_MEMBER' ? nyscCorpMember : undefined,
      interestsAndSkills: interests,
    };

    const payload = buildAIPayload(formData);

    setIsSubmitting(true);

    try {
      await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setSubmittedPayload(payload);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (isSubmitted && submittedPayload) {
    return (
      <div className="form-success">
        <div className="success-icon">🎉</div>
        <h2>Assessment submitted!</h2>
        <p>
          Thank you, <strong>{submittedPayload.respondentName}</strong>! Your responses will
          help train our career-guidance AI to support undergraduates and fresh graduates
          across Nigeria.
        </p>
        <details className="payload-debug">
          <summary>View submitted data (developer preview)</summary>
          <pre>{JSON.stringify(submittedPayload, null, 2)}</pre>
        </details>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            setIsSubmitted(false);
            setSubmittedPayload(null);
            setStep(1);
            setRespondentName('');
            setGroup('');
            setCommon(EMPTY_COMMON);
            setITStudent(EMPTY_IT);
            setNYSCCorpMember(EMPTY_NYSC);
            setInterests(EMPTY_INTERESTS);
          }}
        >
          Submit another response
        </button>
      </div>
    );
  }

  // ── Form layout ───────────────────────────────────────────────────────────

  return (
    <div className="assessment-form">
      {/* Progress bar */}
      <div className="progress-bar" role="progressbar" aria-valuenow={step} aria-valuemax={STEPS.length}>
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`progress-step${step >= s.id ? ' progress-step--done' : ''}${step === s.id ? ' progress-step--active' : ''}`}
          >
            <div className="progress-step__dot">{step > s.id ? '✓' : s.id}</div>
            <span className="progress-step__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="form-body">
        {step === 1 && (
          <Welcome
            respondentName={respondentName}
            onChange={(name) => {
              setRespondentName(name);
              setErrors((prev) => ({ ...prev, respondentName: undefined }));
            }}
            errors={errors}
          />
        )}

        {step === 2 && (
          <GroupSelection
            group={group}
            onChange={(g) => {
              setGroup(g);
              setErrors({});
            }}
            errors={errors}
          />
        )}

        {step === 3 && group && (
          <BasicInfo
            group={group}
            common={common}
            itStudent={itStudent}
            nyscCorpMember={nyscCorpMember}
            onChangeCommon={handleCommonChange}
            onChangeIT={handleITChange}
            onChangeNYSC={handleNYSCChange}
            errors={errors}
          />
        )}

        {step === 4 && (
          <SubtleQuestions
            data={interests}
            onChange={handleInterestsChange}
            errors={errors}
          />
        )}

        {step === 5 && group && (
          <Review
            data={{
              respondentName,
              group,
              common,
              itStudent: group === 'IT_STUDENT' ? itStudent : undefined,
              nyscCorpMember:
                group === 'NYSC_CORP_MEMBER' ? nyscCorpMember : undefined,
              interestsAndSkills: interests,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div className="form-nav">
          {step > 1 && (
            <button type="button" className="btn btn--secondary" onClick={goBack}>
              ← Back
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={goNext}>
            {step === 4 ? 'Review answers →' : 'Continue →'}
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="form-nav">
          <button type="button" className="btn btn--secondary" onClick={goBack}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

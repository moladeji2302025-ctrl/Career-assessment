import type { AssessmentFormData } from '../../types/assessment';
import { SCENARIO_QUESTIONS } from '../../data/scenarioQuestions';

interface ReviewProps {
  data: AssessmentFormData;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function ReviewRow({ label, value }: { label: string; value: string | string[] }) {
  const display = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{display || '—'}</span>
    </div>
  );
}

export default function Review({ data, onSubmit, isSubmitting }: ReviewProps) {
  const { respondentName, group, common, itStudent, nyscCorpMember, interestsAndSkills } = data;
  const groupLabel = group === 'IT_STUDENT' ? 'IT Student' : 'NYSC Corp Member';

  return (
    <div className="step-container">
      <h2 className="step-title">Review your answers</h2>
      <p className="step-description">
        Please check your information before submitting. Your data will be passed to our
        career-guidance AI model.
      </p>

      <section className="review-section">
        <h3 className="review-section-title">Personal</h3>
        <ReviewRow label="Full name" value={respondentName} />
      </section>

      <section className="review-section">
        <h3 className="review-section-title">Group</h3>
        <ReviewRow label="Selected group" value={groupLabel} />
      </section>

      <section className="review-section">
        <h3 className="review-section-title">Organisation Placement</h3>
        <ReviewRow
          label="Department posted to"
          value={common.organizationDepartment}
        />
      </section>

      {group === 'IT_STUDENT' && itStudent && (
        <section className="review-section">
          <h3 className="review-section-title">IT Student Details</h3>
          <ReviewRow label="Programme / Department in school" value={itStudent.schoolProgram} />
          <ReviewRow
            label="Expected completion date"
            value={itStudent.expectedCompletionDate}
          />
        </section>
      )}

      {group === 'NYSC_CORP_MEMBER' && nyscCorpMember && (
        <section className="review-section">
          <h3 className="review-section-title">NYSC Corp Member Details</h3>
          <ReviewRow label="Programme studied" value={nyscCorpMember.programStudied} />
          <ReviewRow label="Degree required" value={nyscCorpMember.degreeRequired} />
          <ReviewRow label="Service end date" value={nyscCorpMember.serviceEndDate} />
        </section>
      )}

      <section className="review-section">
        <h3 className="review-section-title">Interests &amp; Skills</h3>
        <ReviewRow
          label="Career interests"
          value={interestsAndSkills.careerInterests}
        />
        <ReviewRow
          label="Enjoyed skills"
          value={interestsAndSkills.enjoyedSkills}
        />
        <ReviewRow
          label="Work environment preference"
          value={interestsAndSkills.workEnvironment}
        />
        <ReviewRow
          label="Primary motivation"
          value={interestsAndSkills.primaryMotivation}
        />
        <ReviewRow label="Biggest strength" value={interestsAndSkills.biggestStrength} />
        <ReviewRow label="Short-term goal" value={interestsAndSkills.shortTermGoal} />
        <ReviewRow label="Long-term goal" value={interestsAndSkills.longTermGoal} />
      </section>

      <div className="review-submit">
        <p className="review-note">
          By submitting, you agree that your data will be used to help build a career-guidance
          tool for undergraduates and fresh graduates in Nigeria.
        </p>
        <button
          type="button"
          className="btn btn--primary btn--large"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting…' : 'Submit Assessment ✓'}
        </button>
      </div>
    </div>
  );
}

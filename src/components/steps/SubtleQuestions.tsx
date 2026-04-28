import type {
  InterestsAndSkillsFields,
  ValidationErrors,
} from '../../types/assessment';
import {
  CAREER_INTEREST_CATEGORIES,
  ENJOYED_SKILLS_OPTIONS,
  WORK_ENVIRONMENT_OPTIONS,
  PRIMARY_MOTIVATION_OPTIONS,
  BIGGEST_STRENGTH_OPTIONS,
} from '../../data/organizationDepartments';
import { SCENARIO_QUESTIONS } from '../../data/scenarioQuestions';
import FormField from '../ui/FormField';
import CheckboxGroup from '../ui/CheckboxGroup';
import CategorizedCheckboxGroup from '../ui/CategorizedCheckboxGroup';

interface SubtleQuestionsProps {
  data: InterestsAndSkillsFields;
  onChange: (field: keyof InterestsAndSkillsFields, value: string | string[] | Record<string, string>) => void;
  errors: ValidationErrors;
}

export default function SubtleQuestions({ data, onChange, errors }: SubtleQuestionsProps) {
  const handleScenarioChange = (questionId: string, value: string) => {
    onChange('scenarioResponses', { ...data.scenarioResponses, [questionId]: value });
  };

  return (
    <div className="step-container">
      <h2 className="step-title">Interests &amp; Skills</h2>
      <p className="step-description">
        These questions help us understand who you are beyond your formal studies — your
        passions, natural strengths, and what drives you. There are no right or wrong answers.
      </p>

      {/* ── Scenario-based interest questions ─────────────────────────────── */}
      <section className="scenario-section">
        <h3 className="scenario-section__title">
          📝 Scenario Questions
        </h3>
        <p className="scenario-section__description">
          Read each scenario and choose the option that best describes how you would naturally
          respond. These subtle questions help surface your true interests and working style.
        </p>

        {/* Scenario questions are not validated individually — they are optional enrichment data */}
        {SCENARIO_QUESTIONS.map((sq, index) => (
          <div key={sq.id} className="scenario-question">
            <p className="scenario-question__text">
              <span className="scenario-question__number">{index + 1}.</span>{' '}
              {sq.question}
            </p>
            <div className="radio-group" role="radiogroup" aria-label={sq.question}>
              {sq.options.map((opt) => (
                <label key={opt.value} className="radio-option">
                  <input
                    type="radio"
                    name={sq.id}
                    value={opt.value}
                    checked={data.scenarioResponses[sq.id] === opt.value}
                    onChange={() => handleScenarioChange(sq.id, opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Career interests */}
      <FormField
        label="Career areas that interest you"
        htmlFor="careerInterests"
        error={errors.careerInterests}
        hint="Select all that apply — careers are grouped by field"
        required
      >
        <CategorizedCheckboxGroup
          id="careerInterests"
          categories={CAREER_INTEREST_CATEGORIES}
          selected={data.careerInterests}
          onChange={(val) => onChange('careerInterests', val)}
        />
      </FormField>

      {/* Enjoyed skills */}
      <FormField
        label="Skills you genuinely enjoy using"
        htmlFor="enjoyedSkills"
        error={errors.enjoyedSkills}
        hint="Select all that apply — think about what comes naturally and energises you"
        required
      >
        <CheckboxGroup
          id="enjoyedSkills"
          options={ENJOYED_SKILLS_OPTIONS}
          selected={data.enjoyedSkills}
          onChange={(val) => onChange('enjoyedSkills', val)}
          columns={2}
        />
      </FormField>

      {/* Work environment */}
      <FormField
        label="Preferred work environment"
        htmlFor="workEnvironment"
        error={errors.workEnvironment}
        required
      >
        <div className="radio-group" role="radiogroup">
          {WORK_ENVIRONMENT_OPTIONS.map((option) => (
            <label key={option} className="radio-option">
              <input
                type="radio"
                name="workEnvironment"
                value={option}
                checked={data.workEnvironment === option}
                onChange={() => onChange('workEnvironment', option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </FormField>

      {/* Primary motivation */}
      <FormField
        label="What motivates you most at work?"
        htmlFor="primaryMotivation"
        error={errors.primaryMotivation}
        required
      >
        <select
          id="primaryMotivation"
          className="form-select"
          value={data.primaryMotivation}
          onChange={(e) => onChange('primaryMotivation', e.target.value)}
        >
          <option value="">— Select one —</option>
          {PRIMARY_MOTIVATION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </FormField>

      {/* Biggest strength */}
      <FormField
        label="Your biggest strength"
        htmlFor="biggestStrength"
        error={errors.biggestStrength}
        required
      >
        <select
          id="biggestStrength"
          className="form-select"
          value={data.biggestStrength}
          onChange={(e) => onChange('biggestStrength', e.target.value)}
        >
          <option value="">— Select one —</option>
          {BIGGEST_STRENGTH_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </FormField>

      {/* Short-term goal */}
      <FormField
        label="Where do you see yourself in 1–2 years?"
        htmlFor="shortTermGoal"
        error={errors.shortTermGoal}
        hint="Be as specific or as broad as you like"
        required
      >
        <textarea
          id="shortTermGoal"
          className="form-textarea"
          rows={3}
          value={data.shortTermGoal}
          onChange={(e) => onChange('shortTermGoal', e.target.value)}
          placeholder="E.g. I want to land a junior software engineer role and build my first production project"
        />
      </FormField>

      {/* Long-term goal */}
      <FormField
        label="Where do you see yourself in 5+ years?"
        htmlFor="longTermGoal"
        error={errors.longTermGoal}
        hint="Your long-term vision for your career or life"
        required
      >
        <textarea
          id="longTermGoal"
          className="form-textarea"
          rows={3}
          value={data.longTermGoal}
          onChange={(e) => onChange('longTermGoal', e.target.value)}
          placeholder="E.g. Lead a product team at an African tech company or start my own venture"
        />
      </FormField>
    </div>
  );
}


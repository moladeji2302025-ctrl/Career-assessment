import type { GroupType, ValidationErrors } from '../../types/assessment';

interface GroupSelectionProps {
  group: GroupType | '';
  onChange: (group: GroupType) => void;
  errors: ValidationErrors;
}

const GROUPS: { value: GroupType; label: string; description: string; icon: string }[] = [
  {
    value: 'IT_STUDENT',
    label: 'IT Student',
    description: 'Currently enrolled in a university or polytechnic programme',
    icon: '🎓',
  },
  {
    value: 'NYSC_CORP_MEMBER',
    label: 'NYSC Corp Member',
    description: 'Serving your mandatory national youth service year',
    icon: '🪖',
  },
];

export default function GroupSelection({ group, onChange, errors }: GroupSelectionProps) {
  return (
    <div className="step-container">
      <h2 className="step-title">Which group do you belong to?</h2>
      <p className="step-description">
        Select the option that best describes your current status within the organisation.
      </p>

      <div className="group-cards">
        {GROUPS.map((g) => (
          <button
            key={g.value}
            type="button"
            className={`group-card${group === g.value ? ' group-card--selected' : ''}`}
            onClick={() => onChange(g.value)}
            aria-pressed={group === g.value}
          >
            <span className="group-card__icon">{g.icon}</span>
            <span className="group-card__label">{g.label}</span>
            <span className="group-card__description">{g.description}</span>
          </button>
        ))}
      </div>

      {errors.group && (
        <p className="form-error" role="alert">
          {errors.group}
        </p>
      )}
    </div>
  );
}

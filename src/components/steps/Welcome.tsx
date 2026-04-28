import type { ValidationErrors } from '../../types/assessment';
import FormField from '../ui/FormField';

interface WelcomeProps {
  respondentName: string;
  onChange: (name: string) => void;
  errors: ValidationErrors;
}

export default function Welcome({ respondentName, onChange, errors }: WelcomeProps) {
  return (
    <div className="step-container">
      <div className="welcome-banner">
        <span className="welcome-banner__icon">👋</span>
        <div>
          <h2 className="step-title">Welcome to the Career Assessment</h2>
          <p className="step-description">
            This assessment helps us understand your background, interests, and skills so we
            can guide you towards the right career path. It takes about 5 minutes to complete.
          </p>
        </div>
      </div>

      <FormField
        label="Your full name"
        htmlFor="respondentName"
        error={errors.respondentName}
        hint="Enter the name you'd like us to use throughout this assessment"
        required
      >
        <input
          id="respondentName"
          type="text"
          className="form-input"
          value={respondentName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Adaeze Okonkwo"
          autoFocus
          autoComplete="name"
        />
      </FormField>
    </div>
  );
}

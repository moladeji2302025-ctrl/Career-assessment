import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor} className="form-label">
        {label}
        {required && <span className="required-star" aria-hidden="true">*</span>}
      </label>
      {hint && <p className="form-hint">{hint}</p>}
      {children}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

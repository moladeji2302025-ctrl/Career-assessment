import { useEffect, useRef } from 'react';
import type {
  GroupType,
  CommonFields,
  ITStudentFields,
  NYSCCorpMemberFields,
  ValidationErrors,
} from '../../types/assessment';
import { getDegreeForProgram, PROGRAM_NAMES } from '../../data/programDegreeMapping';
import { ORGANIZATION_DEPARTMENTS } from '../../data/organizationDepartments';
import FormField from '../ui/FormField';

interface BasicInfoProps {
  group: GroupType;
  common: CommonFields;
  itStudent: ITStudentFields;
  nyscCorpMember: NYSCCorpMemberFields;
  onChangeCommon: (field: keyof CommonFields, value: string) => void;
  onChangeIT: (field: keyof ITStudentFields, value: string) => void;
  onChangeNYSC: (field: keyof NYSCCorpMemberFields, value: string) => void;
  errors: ValidationErrors;
}

export default function BasicInfo({
  group,
  common,
  itStudent,
  nyscCorpMember,
  onChangeCommon,
  onChangeIT,
  onChangeNYSC,
  errors,
}: BasicInfoProps) {
  const prevProgram = useRef(nyscCorpMember.programStudied);

  // Auto-resolve degree whenever the NYSC programme field changes
  useEffect(() => {
    if (
      group === 'NYSC_CORP_MEMBER' &&
      nyscCorpMember.programStudied !== prevProgram.current
    ) {
      prevProgram.current = nyscCorpMember.programStudied;
      const degree = getDegreeForProgram(nyscCorpMember.programStudied);
      onChangeNYSC('degreeRequired', degree);
    }
  }, [group, nyscCorpMember.programStudied, onChangeNYSC]);

  return (
    <div className="step-container">
      <h2 className="step-title">Basic Information</h2>
      <p className="step-description">Tell us a bit about your background and placement.</p>

      {/* ── Common: organisation department ─────────────────────────────── */}
      <FormField
        label="Department posted to within the organisation"
        htmlFor="organizationDepartment"
        error={errors.organizationDepartment}
        required
      >
        <select
          id="organizationDepartment"
          className="form-select"
          value={common.organizationDepartment}
          onChange={(e) => onChangeCommon('organizationDepartment', e.target.value)}
        >
          <option value="">— Select a department —</option>
          {ORGANIZATION_DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </FormField>

      {/* ── IT-Student fields ────────────────────────────────────────────── */}
      {group === 'IT_STUDENT' && (
        <>
          <FormField
            label="Programme / Department in school"
            htmlFor="schoolProgram"
            error={errors.schoolProgram}
            hint="E.g. Computer Science, Electrical Engineering, Business Administration"
            required
          >
            <input
              id="schoolProgram"
              type="text"
              className="form-input"
              value={itStudent.schoolProgram}
              onChange={(e) => onChangeIT('schoolProgram', e.target.value)}
              placeholder="Enter your current programme or department"
            />
          </FormField>

          <FormField
            label="Expected programme completion date"
            htmlFor="expectedCompletionDate"
            error={errors.expectedCompletionDate}
            hint="The date you expect to graduate or finish your programme"
            required
          >
            <input
              id="expectedCompletionDate"
              type="date"
              className="form-input"
              value={itStudent.expectedCompletionDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => onChangeIT('expectedCompletionDate', e.target.value)}
            />
          </FormField>
        </>
      )}

      {/* ── NYSC Corp-Member fields ──────────────────────────────────────── */}
      {group === 'NYSC_CORP_MEMBER' && (
        <>
          <FormField
            label="Programme studied in school"
            htmlFor="programStudied"
            error={errors.programStudied}
            hint="Start typing to see suggestions, or enter your programme directly"
            required
          >
            <input
              id="programStudied"
              type="text"
              className="form-input"
              list="program-suggestions"
              value={nyscCorpMember.programStudied}
              onChange={(e) => onChangeNYSC('programStudied', e.target.value)}
              placeholder="E.g. Computer Science, Law, Accounting"
            />
            <datalist id="program-suggestions">
              {PROGRAM_NAMES.map((p) => (
                <option key={p} value={p.charAt(0).toUpperCase() + p.slice(1)} />
              ))}
            </datalist>
          </FormField>

          <FormField
            label="Degree required"
            htmlFor="degreeRequired"
            hint="Auto-filled based on your programme. Edit if your institution uses a different title."
            error={errors.degreeRequired}
            required
          >
            <input
              id="degreeRequired"
              type="text"
              className="form-input form-input--auto"
              value={nyscCorpMember.degreeRequired}
              onChange={(e) => onChangeNYSC('degreeRequired', e.target.value)}
              placeholder="Will be filled automatically"
            />
            {nyscCorpMember.degreeRequired && (
              <p className="form-auto-note">
                ✅ Automatically determined from your programme
              </p>
            )}
            {nyscCorpMember.programStudied &&
              !nyscCorpMember.degreeRequired && (
                <p className="form-auto-note form-auto-note--warn">
                  ⚠️ Programme not recognised — please enter your degree manually
                </p>
              )}
          </FormField>

          <FormField
            label="Service end date with the organisation"
            htmlFor="serviceEndDate"
            error={errors.serviceEndDate}
            hint="The date your NYSC posting with this organisation ends"
            required
          >
            <input
              id="serviceEndDate"
              type="date"
              className="form-input"
              value={nyscCorpMember.serviceEndDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => onChangeNYSC('serviceEndDate', e.target.value)}
            />
          </FormField>
        </>
      )}
    </div>
  );
}

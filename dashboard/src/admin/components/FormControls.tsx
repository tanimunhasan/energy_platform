import { useId, type ReactNode } from "react";

interface FieldShellProps {
  label: string;
  error?: string;
  children: (id: string) => ReactNode;
}

function FieldShell({ label, error, children }: FieldShellProps) {
  const id = useId();
  return (
    <label className={`admin-field${error ? " has-error" : ""}`} htmlFor={id}>
      <span>{label}</span>
      {children(id)}
      {error && <small>{error}</small>}
    </label>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "number" | "date";
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  min,
  max,
  step
}: TextFieldProps) {
  return (
    <FieldShell label={label} error={error}>
      {(id) => (
        <input
          id={id}
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldShell>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function TextAreaField({
  label,
  value,
  onChange,
  error,
  placeholder
}: TextAreaFieldProps) {
  return (
    <FieldShell label={label} error={error}>
      {(id) => (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          rows={5}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldShell>
  );
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  error
}: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error}>
      {(id) => (
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

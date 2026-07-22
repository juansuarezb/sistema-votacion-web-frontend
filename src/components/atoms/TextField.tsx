import type { InputHTMLAttributes } from 'react';
import './TextField.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Extra content rendered inside the field wrapper, e.g. a password toggle icon */
  trailingSlot?: React.ReactNode;
  label?: string;
  error?: string;
}

export default function TextField({ trailingSlot, label, error, className = '', ...rest }: TextFieldProps) {
  return (
    <div className="text-field-wrapper">
      {(label || error) && (
        <div className="text-field-header">
          {label && <label className="text-field-label" htmlFor={rest.id || rest.name}>{label}</label>}
          {error && <span className="text-field-error">{error}</span>}
        </div>
      )}
      <div className={`box-large-group ${error ? 'has-error' : ''}`}>
        <input className={`box-large-input ${className}`.trim()} {...rest} />
        {trailingSlot}
      </div>
    </div>
  );
}

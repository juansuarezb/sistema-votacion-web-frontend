import { useState, type InputHTMLAttributes } from 'react';
import TextField from '../atoms/TextField';
import Icon from '../atoms/Icon';
import './PasswordField.css';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showStrengthBar?: boolean;
}

export default function PasswordField({ label, error, showStrengthBar, ...props }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const passwordValue = (props.value as string) || '';
  const strengthScore = calculateStrength(passwordValue);

  const getStrengthLabel = (score: number) => {
    if (passwordValue.length === 0) return '';
    if (score <= 2) return 'Débil';
    if (score === 3 || score === 4) return 'Buena';
    return 'Fuerte';
  };

  return (
    <div className="password-field-container">
      <TextField
        type={showPassword ? "text" : "password"}
        label={label}
        error={error}
        trailingSlot={
          <button 
            type="button" 
            onClick={togglePasswordVisibility} 
            className="password-toggle-icon"
            style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <Icon 
              name={showPassword ? "eye-block" : "eye"} 
              alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} 
            />
          </button>
        }
        {...props}
      />
      
      {showStrengthBar && passwordValue.length > 0 && (
        <div className="password-strength-container">
          <div className="password-strength-bars">
            <div className={`strength-bar ${strengthScore >= 1 ? 'active s-' + Math.min(strengthScore, 3) : ''}`}></div>
            <div className={`strength-bar ${strengthScore >= 3 ? 'active s-' + Math.min(strengthScore, 4) : ''}`}></div>
            <div className={`strength-bar ${strengthScore >= 5 ? 'active s-5' : ''}`}></div>
          </div>
          <span className={`strength-label s-text-${Math.min(strengthScore, 5)}`}>
            {getStrengthLabel(strengthScore)}
          </span>
        </div>
      )}
    </div>
  );
}

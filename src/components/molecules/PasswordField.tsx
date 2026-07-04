import type { InputHTMLAttributes } from 'react';
import TextField from '../atoms/TextField';
import Icon from '../atoms/Icon';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * View-only rendition of the password field: the eye icon is purely decorative here
 * since no visibility-toggling behavior is implemented (views only, per scope).
 */
export default function PasswordField(props: PasswordFieldProps) {
  return (
    <TextField
      type="password"
      trailingSlot={
        <Icon name="eye" alt="Mostrar contraseña" className="password-toggle-icon" />
      }
      {...props}
    />
  );
}

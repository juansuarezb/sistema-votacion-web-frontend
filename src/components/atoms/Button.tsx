import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type AtomVariant = 'default' | 'choose' | 'sinrelleno';
type AtomSize = 'large' | 'medium' | 'normal' | 'mini';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /**
   * 'auth'   -> botón uppercase de formularios de autenticación (login / registro)
   * 'action' -> botón de acción primaria (resumen, lista de votaciones activas)
   * 'nav'    -> botón de navegación entre pasos (voto)
   * otherwise falls back to the base `.a-btn` atom (default / choose / sinrelleno + size)
   */
  variant?: AtomVariant | 'auth' | 'action' | 'nav';
  size?: AtomSize;
}

export default function Button({
  children,
  variant = 'default',
  size = 'normal',
  className = '',
  ...rest
}: ButtonProps) {
  if (variant === 'auth') {
    return (
      <button className={`btn-auth ${className}`.trim()} {...rest}>
        {children}
      </button>
    );
  }

  if (variant === 'action') {
    return (
      <button className={`btn-action ${className}`.trim()} {...rest}>
        {children}
      </button>
    );
  }

  if (variant === 'nav') {
    return (
      <button className={`btn-nav ${className}`.trim()} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <button
      className={`a-btn a-btn--${variant} a-btn--${size} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

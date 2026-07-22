import type { ReactNode } from 'react';
import Icon from '../atoms/Icon';
import './AuthCard.css';

interface AuthCardProps {
  children: ReactNode;
  errorMessage?: string;
  title?: string;
  description?: string;
}

export default function AuthCard({ children, errorMessage, title, description }: AuthCardProps) {
  return (
    <div className="login-card">
      <Icon name="votoSeguro" alt="Logo Voto Seguro Ecuador" className="login-logo" />

      {(title || description) && (
        <div className="auth-card-header">
          {title && <h2 className="auth-card-title">{title}</h2>}
          {description && <p className="auth-card-description">{description}</p>}
        </div>
      )}

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {children}
    </div>
  );
}

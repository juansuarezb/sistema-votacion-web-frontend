import type { ReactNode } from 'react';
import BackLink from '../atoms/BackLink';
import Icon from '../atoms/Icon';
import './AuthCard.css';

interface AuthCardProps {
  children: ReactNode;
  errorMessage?: string;
}

export default function AuthCard({ children, errorMessage }: AuthCardProps) {
  return (
    <div className="login-card">
      <BackLink href="#" label="Inicio" />
      <Icon name="votoSeguro" alt="Logo Voto Seguro Ecuador" className="login-logo" />

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {children}
    </div>
  );
}

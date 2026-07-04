import type { AnchorHTMLAttributes } from 'react';
import './BackLink.css';

interface BackLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label?: string;
}

export default function BackLink({ label = 'Inicio', ...rest }: BackLinkProps) {
  return (
    <a className="back-arrow" {...rest}>
      ← <span>{label}</span>
    </a>
  );
}

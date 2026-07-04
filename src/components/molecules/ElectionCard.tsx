import type { ReactNode } from 'react';
import './ElectionCard.css';

export default function ElectionCard({ children }: { children: ReactNode }) {
  return <div className="card-election">{children}</div>;
}

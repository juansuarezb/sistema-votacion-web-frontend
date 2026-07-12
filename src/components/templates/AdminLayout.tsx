import type { ReactNode } from 'react';

import Sidebar from '../organisms/Sidebar';
import Header from '../organisms/Header';
import HelpFloatingButton from '../atoms/HelpFloatingButton';

import './DashboardLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
  welcomeName?: string;

  activeSection?:
    | 'votantes'
    | 'votaciones'
    | 'resultados';

  onGoToVotantes?: () => void;
  onGoToVotaciones?: () => void;
  onGoToResultados?: () => void;

  onLogout?: () => void;
}

export default function AdminLayout({
  children,
  welcomeName,
  activeSection = 'votantes',
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
  onLogout,
}: AdminLayoutProps) {
  return (
    <>
      <Sidebar
        mode="admin"
        seccionActiva={activeSection}
        onGoToVotantes={onGoToVotantes}
        onGoToVotaciones={onGoToVotaciones}
        onGoToResultados={onGoToResultados}
        onLogout={onLogout}
      />

      <Header />

      <div className="main-layout-container">
        <main className="page-content">
          {welcomeName && (
            <h1 className="page-content__welcome">
              Bienvenido, {welcomeName}
            </h1>
          )}

          {children}
        </main>

        <HelpFloatingButton />
      </div>
    </>
  );
}
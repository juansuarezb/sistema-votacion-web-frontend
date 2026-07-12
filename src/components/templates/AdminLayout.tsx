import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

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
  const [menuOpen, setMenuOpen] =
    useState(false);

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <Header
        menuOpen={menuOpen}
        onMenuToggle={() =>
          setMenuOpen((current) => !current)
        }
      />

      <Sidebar
        mode="admin"
        seccionActiva={activeSection}
        isOpen={menuOpen}
        onGoToVotantes={onGoToVotantes}
        onGoToVotaciones={onGoToVotaciones}
        onGoToResultados={onGoToResultados}
        onLogout={onLogout}
        onNavigate={() => setMenuOpen(false)}
      />

      {menuOpen && (
        <button
          type="button"
          className="dashboard-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      )}

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
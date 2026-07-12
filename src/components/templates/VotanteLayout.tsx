import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import Sidebar from '../organisms/Sidebar';
import Header from '../organisms/Header';
import HelpFloatingButton from '../atoms/HelpFloatingButton';

import './DashboardLayout.css';

interface VotanteLayoutProps {
  children: ReactNode;
  seccionActiva?: 'votaciones';
  onLogout?: () => void;
}

export default function VotanteLayout({
  children,
  seccionActiva = 'votaciones',
  onLogout,
}: VotanteLayoutProps) {
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
        mode="votante"
        seccionActiva={seccionActiva}
        isOpen={menuOpen}
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
          {children}
        </main>

        <HelpFloatingButton />
      </div>
    </>
  );
}
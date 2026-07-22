import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import Sidebar from '../organisms/Sidebar';
import Header from '../organisms/Header';
import keycloak from '../../auth/keycloak';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const userName = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || welcomeName || 'Usuario';

  return (
    <>
      <Header
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((current) => !current)}
      />

      <Sidebar
        mode="admin"
        seccionActiva={activeSection}
        isOpen={menuOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        onToggleDesktopCollapse={() => setIsDesktopCollapsed(c => !c)}
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

      <div className={`main-layout-container ${isDesktopCollapsed ? 'main-layout-container--collapsed' : ''}`}>
        <main className="page-content">
          <h1 className="page-content__welcome">
            Bienvenido, {userName}
          </h1>

          {children}
        </main>
      </div>
    </>
  );
}
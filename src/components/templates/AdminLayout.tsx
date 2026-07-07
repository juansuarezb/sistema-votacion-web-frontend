import type { ReactNode } from 'react';
import './AdminLayout.css';
interface AdminLayoutProps {
  children: ReactNode;
  welcomeName?: string;
  activeSection?: 'votantes' | 'votaciones' | 'resultados';
  onGoToVotantes?: () => void;
  onGoToVotaciones?: () => void;
  onGoToResultados?: () => void;
  onLogout?: () => void;
}

export default function AdminLayout({
  children,
  welcomeName,
  activeSection,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
  onLogout,
}: AdminLayoutProps) {
  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          <div className="admin-logo-circle">
            <span>VS</span>
          </div>

          <div>
            <h1>VotoSeguro</h1>
            {welcomeName && <p>Bienvenido, {welcomeName}</p>}
          </div>
        </div>

        <div className="admin-topbar__verified">
          <span className="admin-topbar__bell">🔔</span>
          <strong>Verificado por CNE</strong>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar__nav">
            <button
              type="button"
              className={
                activeSection === 'votantes'
                  ? 'admin-sidebar__item admin-sidebar__item--active'
                  : 'admin-sidebar__item'
              }
              onClick={onGoToVotantes}
            >
              <span>👥</span>
              <strong>Votantes</strong>
            </button>

            <button
              type="button"
              className={
                activeSection === 'votaciones'
                  ? 'admin-sidebar__item admin-sidebar__item--active'
                  : 'admin-sidebar__item'
              }
              onClick={onGoToVotaciones}
            >
              <span>☑️</span>
              <strong>Votaciones</strong>
            </button>

            <button
              type="button"
              className={
                activeSection === 'resultados'
                  ? 'admin-sidebar__item admin-sidebar__item--active'
                  : 'admin-sidebar__item'
              }
              onClick={onGoToResultados}
            >
              <span>📊</span>
              <strong>Resultados</strong>
            </button>
          </nav>

          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={onLogout}
          >
            <span>↩️</span>
            <strong>Cerrar Sesión</strong>
          </button>
        </aside>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
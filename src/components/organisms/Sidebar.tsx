import Icon from '../atoms/Icon';
import './Sidebar.css';

export type DashboardSection =
  | 'votantes'
  | 'votaciones'
  | 'resultados'
  | 'historial';

interface SidebarProps {
  mode?: 'votante' | 'admin';
  seccionActiva?: DashboardSection;

  isOpen?: boolean;
  isDesktopCollapsed?: boolean;

  onGoToVotantes?: () => void;
  onGoToVotaciones?: () => void;
  onGoToResultados?: () => void;
  onGoToHistorial?: () => void;

  onLogout?: () => void;
  onNavigate?: () => void;
  onToggleDesktopCollapse?: () => void;
}

export default function Sidebar({
  mode = 'votante',
  seccionActiva = 'votaciones',
  isOpen = false,
  isDesktopCollapsed = false,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
  onGoToHistorial,
  onLogout,
  onNavigate,
  onToggleDesktopCollapse,
}: SidebarProps) {
  const getItemClassName = (
    section: DashboardSection
  ): string =>
    [
      'o-sidebar__item',
      seccionActiva === section
        ? 'o-sidebar__item--active'
        : '',
    ]
      .filter(Boolean)
      .join(' ');

  const executeNavigation = (
    action?: () => void
  ) => {
    action?.();
    onNavigate?.();
  };

  return (
    <aside
      className={[
        'o-sidebar',
        isOpen ? 'o-sidebar--open' : '',
        isDesktopCollapsed ? 'o-sidebar--collapsed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Menú principal"
    >
      <div className="o-sidebar__toggle-desktop" onClick={onToggleDesktopCollapse} title={isDesktopCollapsed ? "Expandir menú" : "Contraer menú"}>
        <Icon name={isDesktopCollapsed ? "right" : "left"} alt={isDesktopCollapsed ? "Expandir menú" : "Contraer menú"} size={20} />
      </div>
      <nav className="o-sidebar__menu">
        {mode === 'admin' && (
          <button
            type="button"
            className={getItemClassName('votantes')}
            onClick={() =>
              executeNavigation(onGoToVotantes)
            }
            aria-current={
              seccionActiva === 'votantes'
                ? 'page'
                : undefined
            }
          >
            <Icon
              name="person"
              alt=""
              size={40}
            />

            <span className="o-sidebar__text">
              Votantes
            </span>
          </button>
        )}

        <button
          type="button"
          className={getItemClassName('votaciones')}
          onClick={() =>
            executeNavigation(onGoToVotaciones)
          }
          aria-current={
            seccionActiva === 'votaciones'
              ? 'page'
              : undefined
          }
        >
          <Icon
            name="votar"
            alt=""
            size={40}
          />

          <span className="o-sidebar__text">
            Votaciones
          </span>
        </button>

        {mode === 'votante' && (
          <button
            type="button"
            className={getItemClassName('historial')}
            onClick={() =>
              executeNavigation(onGoToHistorial)
            }
            aria-current={
              seccionActiva === 'historial'
                ? 'page'
                : undefined
            }
          >
            <Icon
              name="registro"
              alt=""
              size={40}
            />

            <span className="o-sidebar__text">
              Historial
            </span>
          </button>
        )}

        {mode === 'admin' && (
          <button
            type="button"
            className={getItemClassName('resultados')}
            onClick={() =>
              executeNavigation(onGoToResultados)
            }
            aria-current={
              seccionActiva === 'resultados'
                ? 'page'
                : undefined
            }
          >
            <Icon
              name="registro"
              alt=""
              size={40}
            />

            <span className="o-sidebar__text">
              Resultados
            </span>
          </button>
        )}
      </nav>

      <div className="o-sidebar__footer">
        <button
          type="button"
          className="o-sidebar__item"
          onClick={() =>
            executeNavigation(onLogout)
          }
        >
          <Icon
            name="exit"
            alt=""
            size={40}
          />

          <span className="o-sidebar__text">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
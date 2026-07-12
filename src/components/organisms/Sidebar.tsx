import Icon from '../atoms/Icon';
import './Sidebar.css';

export type DashboardSection =
  | 'votantes'
  | 'votaciones'
  | 'resultados';

interface SidebarProps {
  mode?: 'votante' | 'admin';
  seccionActiva?: DashboardSection;

  onGoToVotantes?: () => void;
  onGoToVotaciones?: () => void;
  onGoToResultados?: () => void;

  onLogout?: () => void;
}

export default function Sidebar({
  mode = 'votante',
  seccionActiva = 'votaciones',
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
  onLogout,
}: SidebarProps) {
  const getItemClassName = (
    section: DashboardSection
  ): string => {
    return [
      'o-sidebar__item',
      seccionActiva === section
        ? 'o-sidebar__item--active'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <aside className="o-sidebar">
      <nav
        className="o-sidebar__menu"
        aria-label="Navegación principal"
      >
        {mode === 'admin' && (
          <button
            type="button"
            className={getItemClassName('votantes')}
            onClick={onGoToVotantes}
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
          onClick={onGoToVotaciones}
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

        {mode === 'admin' && (
          <button
            type="button"
            className={getItemClassName('resultados')}
            onClick={onGoToResultados}
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
          onClick={onLogout}
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
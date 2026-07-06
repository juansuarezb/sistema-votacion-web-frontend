import Icon from '../atoms/Icon';
import './Sidebar.css';

interface SidebarProps {
  /** Matches the `seccionActiva` request attribute from the original JSP */
  seccionActiva?: 'votaciones';
  onLogout?: () => void;
}

export default function Sidebar({ seccionActiva, onLogout }: SidebarProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside className="o-sidebar">
      <div className="o-sidebar__menu">
        <a
          href="#"
          className={`o-sidebar__item ${
            seccionActiva === 'votaciones' ? 'o-sidebar__item--active' : ''
          }`.trim()}
        >
          <Icon name="votar" alt="Votaciones" size={40} />
          <span className="o-sidebar__text">Votaciones</span>
        </a>
      </div>

      <div className="o-sidebar__footer">
        <button
          type="button"
          className="o-sidebar__item"
          onClick={handleLogout}
          style={{
            border: 'none',
            background: 'transparent',
            width: '100%',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Icon name="exit" alt="Cerrar Sesión" size={40} />
          <span className="o-sidebar__text">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
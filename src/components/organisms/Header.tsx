import Icon from '../atoms/Icon';
import './Header.css';

interface HeaderProps {
  menuOpen?: boolean;
  onMenuToggle?: () => void;
}

export default function Header({
  menuOpen = false,
  onMenuToggle,
}: HeaderProps) {
  return (
    <header className="o-header">
      <div className="o-header__brand">
        {onMenuToggle && (
          <button
            type="button"
            className="o-header__menu-button"
            onClick={onMenuToggle}
            aria-label={
              menuOpen
                ? 'Cerrar menú de navegación'
                : 'Abrir menú de navegación'
            }
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        <Icon
          name="votoSeguro"
          alt="VotoSeguro"
          className="o-header__logo"
        />
      </div>

      <div className="o-header__status">
        <Icon
          name="alarm"
          alt=""
          className="o-header__icon"
        />

        <span className="o-header__text">
          Verificado por CNE
        </span>
      </div>
    </header>
  );
}
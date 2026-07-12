import './LandingNav.css';

interface LandingNavProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function LandingNav({
  onLogin,
  onRegister,
}: LandingNavProps) {
  return (
    <nav className="landing-nav">
      <div className="landing-nav__logo">
        VOTOSEGURO
      </div>

      <div className="landing-nav__links">
        <a
          href="#about"
          className="landing-nav__link"
        >
          Acerca de
        </a>

        <a
          href="#services"
          className="landing-nav__link"
        >
          Servicios
        </a>

        <button
          type="button"
          className="landing-nav__link"
          onClick={onLogin}
        >
          Iniciar Sesión
        </button>

        <button
          type="button"
          className="landing-nav__link"
          onClick={onRegister}
        >
          Registrarse
        </button>
      </div>
    </nav>
  );
}
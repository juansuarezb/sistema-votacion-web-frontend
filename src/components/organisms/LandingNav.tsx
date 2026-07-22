import { useState, useEffect } from 'react';
import Icon from '../atoms/Icon';
import './LandingNav.css';

interface LandingNavProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function LandingNav({
  onLogin,
  onRegister,
}: LandingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`landing-header ${isScrolled ? 'landing-header--scrolled' : ''}`}>
      <nav className="landing-nav">
        <a href="#" className="landing-nav__brand" aria-label="VotoSeguro Inicio">
          <Icon name="votoSeguro" size={42} alt="VotoSeguro Logo" className="landing-nav__brand-icon" />
          <div className="landing-nav__brand-text">
            <span className="landing-nav__title">VOTOSEGURO</span>
            <span className="landing-nav__badge">ECUADOR</span>
          </div>
        </a>

        <button 
          type="button"
          className={`landing-nav__toggle ${isMobileMenuOpen ? 'landing-nav__toggle--active' : ''}`}
          aria-label="Abrir menú de navegación"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="landing-nav__toggle-bar"></span>
          <span className="landing-nav__toggle-bar"></span>
          <span className="landing-nav__toggle-bar"></span>
        </button>

        <div className={`landing-nav__menu ${isMobileMenuOpen ? 'landing-nav__menu--open' : ''}`}>
          <div className="landing-nav__links">
            <a
              href="#about"
              className="landing-nav__link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Acerca de
            </a>

            <a
              href="#services"
              className="landing-nav__link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Servicios
            </a>
          </div>

          <div className="landing-nav__actions">
            <button
              type="button"
              className="landing-nav__btn landing-nav__btn--outline"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLogin();
              }}
            >
              Iniciar Sesión
            </button>

            <button
              type="button"
              className="landing-nav__btn landing-nav__btn--primary"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onRegister();
              }}
            >
              Registrarse
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
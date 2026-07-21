import Icon from '../atoms/Icon';
import './LandingHero.css';

export default function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero__content">
        <div className="landing-hero__badge">
          <span className="landing-hero__badge-dot"></span>
          Sistema Oficial de Escrutinio Electrónico
        </div>
        
        <h1 className="landing-hero__title">
          Voto Seguro <br />
          <span className="landing-hero__title-gradient">para todos los ecuatorianos</span>
        </h1>
        
        <p className="landing-hero__description">
          Plataforma avanzada de votación electrónica, transparente y 100% auditable.
          Participa en procesos electorales de manera ágil desde cualquier lugar con total garantía y privacidad.
        </p>

        <div className="landing-hero__stats">
          <div className="landing-hero__stat-item">
            <span className="landing-hero__stat-value">100%</span>
            <span className="landing-hero__stat-label">Cifrado de Extremo a Extremo</span>
          </div>
          <div className="landing-hero__stat-divider"></div>
          <div className="landing-hero__stat-item">
            <span className="landing-hero__stat-value">CNE</span>
            <span className="landing-hero__stat-label">Integración y Certificación</span>
          </div>
          <div className="landing-hero__stat-divider"></div>
          <div className="landing-hero__stat-item">
            <span className="landing-hero__stat-value">Real-time</span>
            <span className="landing-hero__stat-label">Escrutinio Inmediato</span>
          </div>
        </div>
      </div>

      <div className="landing-hero__box">
        <div className="landing-hero__box-header">
          <span className="landing-hero__dot landing-hero__dot--red"></span>
          <span className="landing-hero__dot landing-hero__dot--yellow"></span>
          <span className="landing-hero__dot landing-hero__dot--green"></span>
          <span className="landing-hero__box-title">Garantía Electoral VSE</span>
        </div>
        
        <div className="landing-hero__box-content">
          <div className="landing-hero__box-glow"></div>
          <Icon name="votoSeguro" alt="Voto Seguro Ecuador" className="landing-hero__box-icon" />
          <h3 className="landing-hero__box-heading">Elecciones Seguras</h3>
          <p className="landing-hero__box-subheading">Resultados Transparentes & Verificables</p>

          <div className="landing-hero__box-footer-tag">
            <span>🛡️ Escrutinio Protegido</span>
          </div>
        </div>
      </div>
    </section>
  );
}

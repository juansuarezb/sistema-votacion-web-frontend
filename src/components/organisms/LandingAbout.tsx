import './LandingAbout.css';

export default function LandingAbout() {
  return (
    <section id="about" className="landing-bottom">
      <div className="landing-bottom__container">
        <div className="landing-bottom__text-wrapper">
          <span className="landing-bottom__subtitle">Innovación y Transparencia</span>
          <h2 className="landing-bottom__title">Acerca de Voto Seguro</h2>
          
          <div className="landing-bottom__description">
            <p>
              <strong>Voto Seguro</strong> nace como una iniciativa pionera para modernizar y
              democratizar el proceso electoral en el Ecuador. Nuestro objetivo principal es
              erradicar ineficiencias y ofrecer máxima confianza en cada sufragio.
            </p>
            <p>
              A través de nuestra arquitectura en microservicios y protocolos criptográficos, garantizamos que
              cada ciudadano pueda ejercer su derecho al voto de manera remota, secreta e inalterable.
            </p>
          </div>

          <div className="landing-bottom__highlight">
            <span className="landing-bottom__highlight-icon">🛡️</span>
            <div>
              <strong>Certificación CNE</strong>
              <p>Plataforma auditada y certificada por el Consejo Nacional Electoral (CNE).</p>
            </div>
          </div>
        </div>

        <div className="landing-bottom__image-wrapper">
          <div className="landing-bottom__image-card">
            <img
              src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Acerca de Voto Seguro Ecuador"
              className="landing-bottom__image"
            />
            <div className="landing-bottom__floating-badge">
              <span className="landing-bottom__badge-number">100%</span>
              <span className="landing-bottom__badge-text">Inviolable & Auditable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

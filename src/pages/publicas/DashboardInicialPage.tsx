import LandingNav from '../../components/organisms/LandingNav';
import LandingHero from '../../components/organisms/LandingHero';
import LandingServices from '../../components/organisms/LandingServices';
import LandingAbout from '../../components/organisms/LandingAbout';
import LandingFooter from '../../components/organisms/LandingFooter';

import './DashboardInicialPage.css';

interface DashboardInicialPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function DashboardInicialPage({
  onLogin,
  onRegister,
}: DashboardInicialPageProps) {
  return (
    <div className="landing-container">
      <LandingNav
        onLogin={onLogin}
        onRegister={onRegister}
      />

      <LandingHero />
      <LandingServices />
      <LandingAbout />
      <LandingFooter />
    </div>
  );
}
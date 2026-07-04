import VotanteLayout from '../../components/templates/VotanteLayout';
import DignityTabs from '../../components/molecules/DignityTabs';
import CandidateCard from '../../components/molecules/CandidateCard';
import Button from '../../components/atoms/Button';
import './VotoPage.css';

export default function VotoPage() {
  return (
    <VotanteLayout>
      <DignityTabs labels={['Dignidad 1', 'Dignidad 2', 'Dignidad 3']} />

      <form>
        <div className="candidates-container">
          <CandidateCard
            radioName="opcion"
            value="SI"
            partyName="Sí"
            partyLogo="bandera"
            positions={[{ title: 'Confirmar voto', image: 'person', name: 'A favor' }]}
          />

          <CandidateCard
            radioName="opcion"
            value="NO"
            partyName="No"
            partyBadgeText="NO"
            positions={[{ title: 'Rechazar voto', image: 'person', name: 'En contra' }]}
          />
        </div>

        <div className="navigation-buttons">
          <Button type="button" variant="nav">VOLVER</Button>
          <Button type="submit" variant="nav">VOTAR</Button>
        </div>
      </form>
    </VotanteLayout>
  );
}

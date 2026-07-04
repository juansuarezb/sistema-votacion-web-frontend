import VotanteLayout from '../../components/templates/VotanteLayout';
import ElectionCard from '../../components/molecules/ElectionCard';
import Button from '../../components/atoms/Button';

const votacion = {
  titulo: 'Elección Presidencial 2026',
  descripcion: 'Segunda vuelta electoral',
  fechaCierre: '2026-08-15',
};

export default function ResumenEleccionPage() {
  return (
    <VotanteLayout>
      <h1 className="page-content__welcome">Bienvenido, María Fernanda Torres</h1>

      <ElectionCard>
        <h2 className="card-election__title">{votacion.titulo}</h2>
        <p className="card-election__subtitle">
          {votacion.descripcion} - (Cierre: {votacion.fechaCierre})
        </p>

        <div className="card-election__countdown">
          <p className="card-election__countdown-label">Tiempo restante para la elección</p>
          {/* Vista estática: en el original este valor se actualiza con un setInterval */}
          <div className="card-election__timer">05 : 12 : 30</div>
        </div>

        <Button variant="action">INICIAR PROCESO DE VOTACIÓN</Button>
      </ElectionCard>
    </VotanteLayout>
  );
}

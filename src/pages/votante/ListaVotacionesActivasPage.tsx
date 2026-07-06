import { useEffect, useState } from 'react';
import VotanteLayout from '../../components/templates/VotanteLayout';
import ElectionCard from '../../components/molecules/ElectionCard';
import Button from '../../components/atoms/Button';
import {
  getReferendums,
  getReferendumQuestions,
  getQuestionEligibility,
  type Referendum,
} from '../../services/referendumService';

interface ListaVotacionesActivasPageProps {
  onGoToVote: () => void;
  onLogout: () => void;
}

const ID_VOTANTE_ACTUAL = 1; // Temporal: luego se obtiene desde Keycloak

export default function ListaVotacionesActivasPage({
  onGoToVote,
  onLogout,
}: ListaVotacionesActivasPageProps) {
  const [votacionesActivas, setVotacionesActivas] = useState<Referendum[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarVotacionesDisponibles() {
      try {
        setCargando(true);
        setError('');

        const referendums = await getReferendums();

        const referendumsActivos = referendums.filter(
          (referendum) => referendum.estado === 'ACTIVO'
        );

        const referendumsDisponibles: Referendum[] = [];

        for (const referendum of referendumsActivos) {
          const preguntas = await getReferendumQuestions(
            referendum.idReferendum
          );

          if (preguntas.length === 0) {
            continue;
          }

          const validaciones = await Promise.all(
            preguntas.map((pregunta) =>
              getQuestionEligibility(
                referendum.idReferendum,
                pregunta.idQuestion,
                ID_VOTANTE_ACTUAL
              ).catch(() => null)
            )
          );

          const tienePreguntaPendiente = validaciones.some((validacion) => {
            if (!validacion) {
              return false;
            }

            if (typeof validacion.eligible === 'boolean') {
              return validacion.eligible;
            }

            if (typeof validacion.isEligible === 'boolean') {
              return validacion.isEligible;
            }

            if (typeof validacion.puedeVotar === 'boolean') {
              return validacion.puedeVotar;
            }

            if (typeof validacion.haVotado === 'boolean') {
              return !validacion.haVotado;
            }

            return false;
          });

          if (tienePreguntaPendiente) {
            referendumsDisponibles.push(referendum);
          }
        }

        setVotacionesActivas(referendumsDisponibles);
      } catch (err) {
        console.error('Error al cargar votaciones disponibles:', err);

        if (err instanceof Error) {
          setError(`No se pudieron cargar las votaciones: ${err.message}`);
        } else {
          setError('No se pudieron cargar las votaciones.');
        }
      } finally {
        setCargando(false);
      }
    }

    cargarVotacionesDisponibles();
  }, []);

  const irAVotar = (idReferendum: number) => {
    localStorage.setItem('idReferendumSeleccionado', idReferendum.toString());

    localStorage.removeItem('respuestasVoto');
    localStorage.removeItem('votosRegistrados');
    localStorage.removeItem('ultimoVoto');

    onGoToVote();
  };

  return (
    <VotanteLayout onLogout={onLogout}>
      <h1 className="page-content__welcome">Votaciones Activas</h1>

      {cargando && (
        <ElectionCard>
          <p>Cargando votaciones activas...</p>
        </ElectionCard>
      )}

      {error && (
        <ElectionCard>
          <p style={{ color: 'red' }}>{error}</p>
        </ElectionCard>
      )}

      {!cargando && !error && votacionesActivas.length > 0 && (
        <ElectionCard>
          {votacionesActivas.map((votacion) => (
            <div className="card-election__row" key={votacion.idReferendum}>
              <div>
                <h3 className="card-election__title">{votacion.titulo}</h3>

                {votacion.descripcion && <p>{votacion.descripcion}</p>}

                <small>
                  Cierre: {new Date(votacion.fechaCierre).toLocaleString()}
                </small>
              </div>

              <Button
                type="button"
                variant="action"
                style={{ width: 'auto', padding: '12px 28px' }}
                onClick={() => irAVotar(votacion.idReferendum)}
              >
                Ir a votar
              </Button>
            </div>
          ))}
        </ElectionCard>
      )}

      {!cargando && !error && votacionesActivas.length === 0 && (
        <ElectionCard>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            Sin votaciones activas
          </p>
        </ElectionCard>
      )}
    </VotanteLayout>
  );
}
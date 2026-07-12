import { useEffect, useState } from 'react';

import keycloak from '../../auth/keycloak';

import VotanteLayout from '../../components/templates/VotanteLayout';
import ElectionCard from '../../components/molecules/ElectionCard';
import Button from '../../components/atoms/Button';

import {
  getAssignedReferendumsByVoter,
  type AssignedReferendum,
} from '../../services/referendumService';

import {
  getVotanteByKeycloakId,
} from '../../services/voterService';

interface ListaVotacionesActivasPageProps {
  onGoToVote: () => void;
  onLogout: () => void;
}

export default function ListaVotacionesActivasPage({
  onGoToVote,
  onLogout,
}: ListaVotacionesActivasPageProps) {
  const [votacionesActivas, setVotacionesActivas] =
    useState<AssignedReferendum[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarVotacionesDisponibles() {
      try {
        setCargando(true);
        setError('');

        const keycloakId = keycloak.tokenParsed?.sub;

        if (!keycloakId) {
          throw new Error(
            'No se pudo obtener el identificador del usuario autenticado.'
          );
        }

        const perfilVotante =
          await getVotanteByKeycloakId(keycloakId);

        const referendums =
          await getAssignedReferendumsByVoter(
            perfilVotante.idVotante
          );

        setVotacionesActivas(referendums);
      } catch (err) {
        console.error(
          'Error al cargar votaciones asignadas:',
          err
        );

        if (err instanceof Error) {
          setError(
            `No se pudieron cargar las votaciones: ${err.message}`
          );
        } else {
          setError(
            'No se pudieron cargar las votaciones.'
          );
        }
      } finally {
        setCargando(false);
      }
    }

    cargarVotacionesDisponibles();
  }, []);

  const irAVotar = (
    idReferendum: number,
    idVotante: number
  ) => {
    localStorage.setItem(
      'idReferendumSeleccionado',
      idReferendum.toString()
    );

    localStorage.setItem(
      'idVotanteActual',
      idVotante.toString()
    );

    localStorage.removeItem('respuestasVoto');
    localStorage.removeItem('votosRegistrados');
    localStorage.removeItem('ultimoVoto');

    onGoToVote();
  };

  return (
    <VotanteLayout onLogout={onLogout}>
      <h1 className="page-content__welcome">
        Votaciones Activas
      </h1>

      {cargando && (
        <ElectionCard>
          <p>Cargando votaciones activas...</p>
        </ElectionCard>
      )}

      {error && (
        <ElectionCard>
          <p style={{ color: 'red' }}>
            {error}
          </p>
        </ElectionCard>
      )}

      {!cargando &&
        !error &&
        votacionesActivas.length > 0 && (
          <ElectionCard>
            {votacionesActivas.map((votacion) => (
              <div
                className="card-election__row"
                key={votacion.idReferendum}
              >
                <div>
                  <h3 className="card-election__title">
                    {votacion.titulo}
                  </h3>

                  {votacion.descripcion && (
                    <p>{votacion.descripcion}</p>
                  )}

                  <small>
                    Preguntas pendientes:{' '}
                    {votacion.preguntasPendientes}
                  </small>

                  <br />

                  <small>
                    Cierre:{' '}
                    {new Date(
                      votacion.fechaCierre
                    ).toLocaleString()}
                  </small>
                </div>

                <Button
                  type="button"
                  variant="action"
                  style={{
                    width: 'auto',
                    padding: '12px 28px',
                  }}
                  onClick={async () => {
                    const keycloakId =
                      keycloak.tokenParsed?.sub;

                    if (!keycloakId) {
                      setError(
                        'No se pudo identificar al votante.'
                      );
                      return;
                    }

                    const perfil =
                      await getVotanteByKeycloakId(
                        keycloakId
                      );

                    irAVotar(
                      votacion.idReferendum,
                      perfil.idVotante
                    );
                  }}
                >
                  Ir a votar
                </Button>
              </div>
            ))}
          </ElectionCard>
        )}

      {!cargando &&
        !error &&
        votacionesActivas.length === 0 && (
          <ElectionCard>
            <p
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              Sin votaciones activas
            </p>
          </ElectionCard>
        )}
    </VotanteLayout>
  );
}
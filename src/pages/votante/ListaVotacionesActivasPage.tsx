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

function CountdownTimer({ fechaCierre }: { fechaCierre: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const targetDate = new Date(fechaCierre).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft('Cerrado');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' '));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [fechaCierre]);

  return <span style={{ color: '#dc2626', fontWeight: 800 }}>{timeLeft}</span>;
}

interface ListaVotacionesActivasPageProps {
  modo?: 'activas' | 'historial';
  onGoToVote: () => void;
  onLogout: () => void;
  onGoToVotaciones?: () => void;
  onGoToHistorial?: () => void;
}

export default function ListaVotacionesActivasPage({
  modo = 'activas',
  onGoToVote,
  onLogout,
  onGoToVotaciones,
  onGoToHistorial,
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

  const votacionesFiltradas = votacionesActivas.filter((v) => {
    if (modo === 'historial') return v.preguntasPendientes === 0;
    return v.preguntasPendientes > 0;
  });

  return (
    <VotanteLayout 
      onLogout={onLogout} 
      seccionActiva={modo === 'historial' ? 'historial' : 'votaciones'}
      onGoToVotaciones={onGoToVotaciones}
      onGoToHistorial={onGoToHistorial}
    >
      <h1 className="page-content__welcome">
        {modo === 'historial' ? 'Historial de Votaciones' : 'Votaciones Activas'}
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
        votacionesFiltradas.length > 0 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {votacionesFiltradas.map((votacion) => {
              const completado = votacion.preguntasPendientes === 0;

              return (
                <div
                  key={votacion.idReferendum}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: '1 1 min-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>
                        {votacion.titulo}
                      </h3>
                      {completado && (
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                          Completado
                        </span>
                      )}
                    </div>

                    {votacion.descripcion && (
                      <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '16px' }}>{votacion.descripcion}</p>
                    )}

                    <div style={{ display: 'flex', gap: '16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                      {!completado && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          Preguntas pendientes: <span style={{ color: '#0f172a', fontWeight: 700 }}>{votacion.preguntasPendientes}</span>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        Cierre en: <CountdownTimer fechaCierre={votacion.fechaCierre} />
                      </div>
                    </div>
                  </div>

                  {!completado ? (
                    <Button
                      type="button"
                      variant="action"
                      style={{
                        padding: '12px 32px',
                        backgroundColor: '#0d47a1',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
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
                  ) : (
                    <div style={{ padding: '12px 32px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '8px', fontWeight: 600, fontSize: '15px', border: '1px solid #cbd5e1' }}>
                      Voto Registrado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {!cargando &&
        !error &&
        votacionesFiltradas.length === 0 && (
          <ElectionCard>
            <p
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              {modo === 'historial' ? 'No tienes votaciones completadas' : 'Sin votaciones activas'}
            </p>
          </ElectionCard>
        )}
    </VotanteLayout>
  );
}
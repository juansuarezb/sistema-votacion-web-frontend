import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  getVotantes,
  type Votante,
} from '../../services/voterService';
import {
  assignVoterToReferendum,
  getReferendumById,
  getReferendumQuestions,
  getVoterAssignmentStatuses,
  type ReferendumQuestion,
  type VoterAssignmentStatus,
} from '../../services/referendumService';

interface AsignacionVotantesPageProps {
  idReferendum: number;
  onLogout: () => void;
  onBack: () => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

type EstadoVisualVotante =
  | 'DISPONIBLE'
  | 'ASIGNADO'
  | 'COMPLETADO';

export default function AsignacionVotantesPage({
  idReferendum,
  onLogout,
  onBack,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: AsignacionVotantesPageProps) {
  const [tituloReferendum, setTituloReferendum] = useState('');
  const [votantes, setVotantes] = useState<Votante[]>([]);
  const [preguntas, setPreguntas] = useState<ReferendumQuestion[]>([]);
  const [estados, setEstados] = useState<VoterAssignmentStatus[]>([]);
  const [idVotante, setIdVotante] = useState('');
  const [cargando, setCargando] = useState(true);
  const [asignando, setAsignando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const estadosPorVotante = useMemo(
    () =>
      new Map(
        estados.map((estado) => [
          estado.idVotante,
          estado,
        ])
      ),
    [estados]
  );

  const obtenerEstadoVotante = (
    id: number
  ): EstadoVisualVotante => {
    const estado = estadosPorVotante.get(id);

    if (!estado) {
      return 'DISPONIBLE';
    }

    return estado.haCompletado
      ? 'COMPLETADO'
      : 'ASIGNADO';
  };

  const obtenerTextoEstado = (
    id: number
  ): string => {
    const estado = estadosPorVotante.get(id);

    if (!estado) {
      return 'Disponible';
    }

    if (estado.haCompletado) {
      return 'Ya votó';
    }

    return `Asignado - ${estado.preguntasPendientes} pendiente(s)`;
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');
      setMensaje('');

      const [
        referendum,
        voters,
        questions,
        voterStatuses,
      ] = await Promise.all([
        getReferendumById(idReferendum),
        getVotantes(),
        getReferendumQuestions(idReferendum),
        getVoterAssignmentStatuses(idReferendum),
      ]);

      setTituloReferendum(referendum.titulo);
      setVotantes(voters);
      setPreguntas(questions);
      setEstados(voterStatuses);

      const idsBloqueados = new Set(
        voterStatuses.map((status) => status.idVotante)
      );

      const primerDisponible = voters.find(
        (voter) => !idsBloqueados.has(voter.idVotante)
      );

      setIdVotante(
        primerDisponible
          ? primerDisponible.idVotante.toString()
          : ''
      );
    } catch (err) {
      console.error(
        'Error al cargar asignación:',
        err
      );

      if (err instanceof Error) {
        setError(
          `No se pudieron cargar los datos: ${err.message}`
        );
      } else {
        setError(
          'No se pudieron cargar los datos.'
        );
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, [idReferendum]);

  const handleCambioVotante = (
    nuevoId: string
  ) => {
    if (!nuevoId) {
      setIdVotante('');
      return;
    }

    const estado =
      obtenerEstadoVotante(Number(nuevoId));

    if (estado === 'COMPLETADO') {
      setError(
        'Este votante ya completó la votación y no puede volver a asignarse.'
      );
      setMensaje('');
      return;
    }

    if (estado === 'ASIGNADO') {
      setError(
        'Este votante ya está asignado a la votación.'
      );
      setMensaje('');
      return;
    }

    setIdVotante(nuevoId);
    setError('');
    setMensaje('');
  };

  const handleAsignar = async () => {
    if (!idVotante) {
      setError(
        'No existen votantes disponibles para asignar.'
      );
      return;
    }

    const idSeleccionado = Number(idVotante);
    const estado =
      obtenerEstadoVotante(idSeleccionado);

    if (estado === 'COMPLETADO') {
      setError(
        'El votante ya completó esta votación.'
      );
      return;
    }

    if (estado === 'ASIGNADO') {
      setError(
        'El votante ya está asignado a esta votación.'
      );
      return;
    }

    try {
      setAsignando(true);
      setMensaje('');
      setError('');

      await assignVoterToReferendum(
        idReferendum,
        idSeleccionado
      );

      setMensaje(
        'Votante asignado correctamente a todas las preguntas del referéndum.'
      );

      // Se vuelve a consultar el backend para reflejar el nuevo estado y
      // evitar que el mismo votante permanezca seleccionable.
      await cargarDatos();
    } catch (err) {
      console.error(
        'Error al asignar votante:',
        err
      );

      if (err instanceof Error) {
        setError(
          `No se pudo asignar el votante: ${err.message}`
        );
      } else {
        setError(
          'No se pudo asignar el votante.'
        );
      }
    } finally {
      setAsignando(false);
    }
  };

  const votantesDisponibles = votantes.filter(
    (votante) =>
      obtenerEstadoVotante(votante.idVotante) ===
      'DISPONIBLE'
  );

  return (
    <AdminLayout
      welcomeName="Admin"
      activeSection="votaciones"
      onLogout={onLogout}
      onGoToVotantes={onGoToVotantes}
      onGoToVotaciones={onGoToVotaciones}
      onGoToResultados={onGoToResultados}
    >
      <section className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">
            Asignación de Votantes
          </h2>
        </div>

        {cargando && <p>Cargando datos...</p>}

        {error && (
          <p className="admin-error">
            {error}
          </p>
        )}

        {!cargando && (
          <>
            <p>
              <strong>Referéndum:</strong>{' '}
              {tituloReferendum}
            </p>

            <div className="admin-form">
              <div className="admin-form__group">
                <label htmlFor="votante">
                  Votante
                </label>

                <select
                  id="votante"
                  value={idVotante}
                  onChange={(event) =>
                    handleCambioVotante(
                      event.target.value
                    )
                  }
                  disabled={
                    asignando ||
                    votantesDisponibles.length === 0
                  }
                >
                  {votantesDisponibles.length === 0 && (
                    <option value="">
                      No existen votantes disponibles
                    </option>
                  )}

                  {votantes.map((votante) => {
                    const estado = obtenerEstadoVotante(
                      votante.idVotante
                    );

                    const bloqueado =
                      estado !== 'DISPONIBLE';

                    return (
                      <option
                        key={votante.idVotante}
                        value={votante.idVotante}
                        disabled={bloqueado}
                        style={{
                          color:
                            estado === 'COMPLETADO'
                              ? '#777'
                              : estado === 'ASIGNADO'
                                ? '#b26a00'
                                : '#1b5e20',
                        }}
                      >
                        {votante.nombre} - {votante.cedula}
                        {' — '}
                        {obtenerTextoEstado(
                          votante.idVotante
                        )}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                marginBottom: '24px',
              }}
            >
              <h3>Estado de los votantes</h3>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                }}
              >
                {votantes.map((votante) => {
                  const estado = obtenerEstadoVotante(
                    votante.idVotante
                  );

                  return (
                    <li
                      key={votante.idVotante}
                      style={{
                        padding: '10px 12px',
                        marginBottom: '8px',
                        borderRadius: '6px',
                        backgroundColor:
                          estado === 'COMPLETADO'
                            ? '#eeeeee'
                            : estado === 'ASIGNADO'
                              ? '#fff3e0'
                              : '#e8f5e9',
                        color:
                          estado === 'COMPLETADO'
                            ? '#666'
                            : estado === 'ASIGNADO'
                              ? '#8a4b00'
                              : '#1b5e20',
                      }}
                    >
                      <strong>
                        {votante.nombre}
                      </strong>
                      {' — '}
                      {obtenerTextoEstado(
                        votante.idVotante
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <h3>Preguntas del referéndum</h3>

            {preguntas.length === 0 && (
              <p>No hay preguntas registradas.</p>
            )}

            <ul>
              {preguntas.map((pregunta) => (
                <li key={pregunta.idQuestion}>
                  {pregunta.texto}
                </li>
              ))}
            </ul>

            <div className="admin-actions">
              <button
                type="button"
                className="admin-button admin-button--primary"
                onClick={handleAsignar}
                disabled={
                  asignando ||
                  !idVotante ||
                  preguntas.length === 0
                }
              >
                {asignando
                  ? 'Asignando...'
                  : 'Asignar votante al referéndum'}
              </button>

              <button
                type="button"
                className="admin-button admin-button--secondary"
                onClick={onBack}
                disabled={asignando}
              >
                Volver
              </button>
            </div>

            {mensaje && (
              <p className="admin-success">
                {mensaje}
              </p>
            )}
          </>
        )}
      </section>
    </AdminLayout>
  );
}
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import { getVotantes, type Votante } from '../../services/voterService';
import {
  assignVoterToReferendum,
  getReferendumById,
  getReferendumQuestions,
  type ReferendumQuestion,
} from '../../services/referendumService';

interface AsignacionVotantesPageProps {
  idReferendum: number;
  onLogout: () => void;
  onBack: () => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

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
  const [idVotante, setIdVotante] = useState('');
  const [cargando, setCargando] = useState(true);
  const [asignando, setAsignando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true);
        setError('');

        const referendum = await getReferendumById(idReferendum);
        const voters = await getVotantes();
        const questions = await getReferendumQuestions(idReferendum);

        setTituloReferendum(referendum.titulo);
        setVotantes(voters);
        setPreguntas(questions);

        if (voters.length > 0) {
          setIdVotante(voters[0].idVotante.toString());
        }
      } catch (err) {
        console.error('Error al cargar asignación:', err);

        if (err instanceof Error) {
          setError(`No se pudieron cargar los datos: ${err.message}`);
        } else {
          setError('No se pudieron cargar los datos.');
        }
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [idReferendum]);

  const handleAsignar = async () => {
    if (!idVotante) {
      alert('Seleccione un votante.');
      return;
    }

    try {
      setAsignando(true);
      setMensaje('');
      setError('');

      await assignVoterToReferendum(idReferendum, Number(idVotante));

      setMensaje('Votante asignado correctamente a todas las preguntas del referéndum.');
    } catch (err) {
      console.error('Error al asignar votante:', err);

      if (err instanceof Error) {
        setError(`No se pudo asignar el votante: ${err.message}`);
      } else {
        setError('No se pudo asignar el votante.');
      }
    } finally {
      setAsignando(false);
    }
  };

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
          <h2 className="admin-page__title">Asignación de Votantes</h2>
        </div>

        {cargando && <p>Cargando datos...</p>}

        {error && <p className="admin-error">{error}</p>}

        {!cargando && (
          <>
            <p>
              <strong>Referéndum:</strong> {tituloReferendum}
            </p>

            <div className="admin-form">
              <div className="admin-form__group">
                <label>Votante</label>
                <select
                  value={idVotante}
                  onChange={(event) => setIdVotante(event.target.value)}
                >
                  {votantes.map((votante) => (
                    <option key={votante.idVotante} value={votante.idVotante}>
                      {votante.nombre} - {votante.cedula}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h3>Preguntas del referéndum</h3>

            {preguntas.length === 0 && <p>No hay preguntas registradas.</p>}

            <ul>
              {preguntas.map((pregunta) => (
                <li key={pregunta.idQuestion}>{pregunta.texto}</li>
              ))}
            </ul>

            <div className="admin-actions">
              <button
                type="button"
                className="admin-button admin-button--primary"
                onClick={handleAsignar}
                disabled={asignando}
              >
                {asignando ? 'Asignando...' : 'Asignar votante al referéndum'}
              </button>

              <button
                type="button"
                className="admin-button admin-button--secondary"
                onClick={onBack}
              >
                Volver
              </button>
            </div>

            {mensaje && <p className="admin-success">{mensaje}</p>}
          </>
        )}
      </section>
    </AdminLayout>
  );
}
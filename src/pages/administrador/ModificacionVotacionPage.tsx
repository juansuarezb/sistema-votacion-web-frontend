import { useEffect, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  createReferendumQuestion,
  getReferendumById,
  getReferendumQuestions,
  updateReferendum,
  type ReferendumQuestion,
} from '../../services/referendumService';

interface ModificacionVotacionPageProps {
  idReferendum: number;
  onLogout: () => void;
  onBack: () => void;
  onUpdated: () => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export default function ModificacionVotacionPage({
  idReferendum,
  onLogout,
  onBack,
  onUpdated,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: ModificacionVotacionPageProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');
  const [estado, setEstado] = useState('ACTIVO');
  const [preguntas, setPreguntas] = useState<ReferendumQuestion[]>([]);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');

      const referendum = await getReferendumById(idReferendum);
      const questions = await getReferendumQuestions(idReferendum);

      setTitulo(referendum.titulo);
      setDescripcion(referendum.descripcion);
      setFechaInicio(toDatetimeLocal(referendum.fechaInicio));
      setFechaCierre(toDatetimeLocal(referendum.fechaCierre));
      setEstado(referendum.estado);
      setPreguntas(questions);
    } catch (err) {
      console.error('Error al cargar votación:', err);

      if (err instanceof Error) {
        setError(`No se pudo cargar la votación: ${err.message}`);
      } else {
        setError('No se pudo cargar la votación.');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [idReferendum]);

  const validar = () => {
    if (!titulo.trim()) return 'El título es obligatorio.';
    if (!descripcion.trim()) return 'La descripción es obligatoria.';
    if (!fechaInicio) return 'La fecha de inicio es obligatoria.';
    if (!fechaCierre) return 'La fecha de cierre es obligatoria.';
    if (new Date(fechaCierre) <= new Date(fechaInicio)) {
      return 'La fecha de cierre debe ser posterior a la fecha de inicio.';
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validar();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setGuardando(true);
      setError('');

      await updateReferendum(idReferendum, {
        titulo,
        descripcion,
        fechaInicio,
        fechaCierre,
        estado,
      });

      onUpdated();
    } catch (err) {
      console.error('Error al actualizar votación:', err);

      if (err instanceof Error) {
        setError(`No se pudo actualizar la votación: ${err.message}`);
      } else {
        setError('No se pudo actualizar la votación.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarPregunta = async () => {
    if (!nuevaPregunta.trim()) {
      alert('Ingrese el texto de la pregunta.');
      return;
    }

    try {
      await createReferendumQuestion(idReferendum, {
        texto: nuevaPregunta,
      });

      setNuevaPregunta('');
      await cargarDatos();
    } catch (err) {
      console.error('Error al agregar pregunta:', err);

      if (err instanceof Error) {
        alert(`No se pudo agregar la pregunta: ${err.message}`);
      } else {
        alert('No se pudo agregar la pregunta.');
      }
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
      <h2>Editar Votación</h2>

      {cargando && <p>Cargando votación...</p>}

      {!cargando && (
        <>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Título</label>
              <br />
              <input
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Descripción</label>
              <br />
              <textarea
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Fecha inicio</label>
              <br />
              <input
                type="datetime-local"
                value={fechaInicio}
                onChange={(event) => setFechaInicio(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Fecha cierre</label>
              <br />
              <input
                type="datetime-local"
                value={fechaCierre}
                onChange={(event) => setFechaCierre(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Estado</label>
              <br />
              <select
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
              >
                <option value="BORRADOR">BORRADOR</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="CERRADO">CERRADO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <br />

            <button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Actualizar'}
            </button>

            {' '}

            <button type="button" onClick={onBack}>
              Volver
            </button>
          </form>

          <hr />

          <h3>Preguntas</h3>

          {preguntas.length === 0 && <p>No hay preguntas registradas.</p>}

          <ul>
            {preguntas.map((pregunta) => (
              <li key={pregunta.idQuestion}>{pregunta.texto}</li>
            ))}
          </ul>

          <div>
            <label>Nueva pregunta</label>
            <br />
            <input
              value={nuevaPregunta}
              onChange={(event) => setNuevaPregunta(event.target.value)}
            />

            {' '}

            <button type="button" onClick={handleAgregarPregunta}>
              Agregar pregunta
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
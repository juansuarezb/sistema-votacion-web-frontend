import { useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  createReferendum,
  createReferendumQuestion,
} from '../../services/referendumService';

interface CreacionVotacionPageProps {
  onLogout: () => void;
  onBack: () => void;
  onCreated: () => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

export default function CreacionVotacionPage({
  onLogout,
  onBack,
  onCreated,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: CreacionVotacionPageProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');
  const [estado, setEstado] = useState('ACTIVO');
  const [preguntasTexto, setPreguntasTexto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const validar = () => {
    if (!titulo.trim()) return 'El título es obligatorio.';
    if (!descripcion.trim()) return 'La descripción es obligatoria.';
    if (!fechaInicio) return 'La fecha de inicio es obligatoria.';
    if (!fechaCierre) return 'La fecha de cierre es obligatoria.';
    if (new Date(fechaCierre) <= new Date(fechaInicio)) {
      return 'La fecha de cierre debe ser posterior a la fecha de inicio.';
    }

    const preguntas = preguntasTexto
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    if (preguntas.length === 0) {
      return 'Debe ingresar al menos una pregunta.';
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

      const referendum = await createReferendum({
        titulo,
        descripcion,
        fechaInicio,
        fechaCierre,
        estado,
      });

      const preguntas = preguntasTexto
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      for (const pregunta of preguntas) {
        await createReferendumQuestion(referendum.idReferendum, {
          texto: pregunta,
        });
      }

      onCreated();
    } catch (err) {
      console.error('Error al crear votación:', err);

      if (err instanceof Error) {
        setError(`No se pudo crear la votación: ${err.message}`);
      } else {
        setError('No se pudo crear la votación.');
      }
    } finally {
      setGuardando(false);
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
      <h2>Crear Votación</h2>

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

        <div>
          <label>Preguntas, una por línea</label>
          <br />
          <textarea
            value={preguntasTexto}
            onChange={(event) => setPreguntasTexto(event.target.value)}
            rows={6}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <br />

        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>

        {' '}

        <button type="button" onClick={onBack}>
          Volver
        </button>
      </form>
    </AdminLayout>
  );
}
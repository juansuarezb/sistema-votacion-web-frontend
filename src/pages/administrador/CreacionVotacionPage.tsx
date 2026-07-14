import { useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  createReferendum,
  createReferendumQuestion,
} from '../../services/referendumService';
import './AdminPages.css';

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
      .map((pregunta) => pregunta.trim())
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
        .map((pregunta) => pregunta.trim())
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
      <section className="admin-page">
        <div className="admin-page__header">
          <div>
            <h2 className="admin-page__title">Crear Votación</h2>

            <p className="admin-page__description">
              Configure el referéndum, su periodo de vigencia y las preguntas
              que deberán responder los votantes.
            </p>
          </div>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__group">
            <label htmlFor="titulo">Título</label>

            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ej. Consulta de presupuesto estudiantil"
              maxLength={200}
              required
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="descripcion">Descripción</label>

            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder="Describa brevemente el objetivo de la votación."
              maxLength={1000}
              rows={4}
              required
            />
          </div>

          <div className="admin-form__row">
            <div className="admin-form__group">
              <label htmlFor="fechaInicio">Fecha de inicio</label>

              <input
                id="fechaInicio"
                type="datetime-local"
                value={fechaInicio}
                onChange={(event) => setFechaInicio(event.target.value)}
                required
              />
            </div>

            <div className="admin-form__group">
              <label htmlFor="fechaCierre">Fecha de cierre</label>

              <input
                id="fechaCierre"
                type="datetime-local"
                value={fechaCierre}
                onChange={(event) => setFechaCierre(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form__group">
            <label htmlFor="estado">Estado inicial</label>

            <select
              id="estado"
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
            >
              <option value="BORRADOR">BORRADOR</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="CERRADO">CERRADO</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>

          <div className="admin-form__group">
            <label htmlFor="preguntas">
              Preguntas del referéndum
            </label>

            <textarea
              id="preguntas"
              value={preguntasTexto}
              onChange={(event) => setPreguntasTexto(event.target.value)}
              placeholder={
                'Escriba una pregunta por línea.\nEjemplo:\n¿Aprueba la propuesta presentada?\n¿Está de acuerdo con el presupuesto?'
              }
              rows={7}
              required
            />

            <small className="admin-form__help">
              Cada línea será registrada como una pregunta independiente.
            </small>
          </div>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-page__footer">
            <button
              type="submit"
              className="admin-button admin-button--primary"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar votación'}
            </button>

            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={onBack}
              disabled={guardando}
            >
              Volver
            </button>
          </div>
        </form>
      </section>
    </AdminLayout>
  );
}
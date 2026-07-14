import { useEffect, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  createReferendumQuestion,
  getReferendumById,
  getReferendumQuestions,
  updateReferendum,
  type ReferendumQuestion,
} from '../../services/referendumService';
import './AdminPages.css';

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
  const [agregandoPregunta, setAgregandoPregunta] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

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
    void cargarDatos();
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
      setMensaje('');

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
      setError('Ingrese el texto de la nueva pregunta.');
      return;
    }

    try {
      setAgregandoPregunta(true);
      setError('');
      setMensaje('');

      await createReferendumQuestion(idReferendum, {
        texto: nuevaPregunta.trim(),
      });

      setNuevaPregunta('');
      await cargarDatos();

      setMensaje('Pregunta agregada correctamente.');
    } catch (err) {
      console.error('Error al agregar pregunta:', err);

      if (err instanceof Error) {
        setError(`No se pudo agregar la pregunta: ${err.message}`);
      } else {
        setError('No se pudo agregar la pregunta.');
      }
    } finally {
      setAgregandoPregunta(false);
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
            <h2 className="admin-page__title">Editar Votación</h2>

            <p className="admin-page__description">
              Modifique la información general y administre las preguntas del
              referéndum.
            </p>
          </div>
        </div>

        {cargando && (
          <p className="admin-message admin-message--loading">
            Cargando votación...
          </p>
        )}

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="admin-success">
            {mensaje}
          </p>
        )}

        {!cargando && (
          <>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form__group">
                <label htmlFor="titulo">Título</label>

                <input
                  id="titulo"
                  type="text"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
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
                <label htmlFor="estado">Estado</label>

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

              <div className="admin-page__footer">
                <button
                  type="submit"
                  className="admin-button admin-button--primary"
                  disabled={guardando || agregandoPregunta}
                >
                  {guardando ? 'Guardando...' : 'Actualizar votación'}
                </button>

                <button
                  type="button"
                  className="admin-button admin-button--secondary"
                  onClick={onBack}
                  disabled={guardando || agregandoPregunta}
                >
                  Volver
                </button>
              </div>
            </form>

            <section className="admin-questions">
              <div className="admin-questions__header">
                <div>
                  <h3 className="admin-questions__title">
                    Preguntas
                  </h3>

                  <p className="admin-questions__description">
                    Preguntas actualmente registradas en el referéndum.
                  </p>
                </div>

                <span className="admin-questions__counter">
                  {preguntas.length}
                </span>
              </div>

              {preguntas.length === 0 ? (
                <p className="admin-message admin-message--empty">
                  No hay preguntas registradas.
                </p>
              ) : (
                <ol className="admin-questions__list">
                  {preguntas.map((pregunta) => (
                    <li
                      key={pregunta.idQuestion}
                      className="admin-questions__item"
                    >
                      {pregunta.texto}
                    </li>
                  ))}
                </ol>
              )}

              <div className="admin-question-create">
                <div className="admin-form__group">
                  <label htmlFor="nuevaPregunta">
                    Nueva pregunta
                  </label>

                  <textarea
                    id="nuevaPregunta"
                    value={nuevaPregunta}
                    onChange={(event) =>
                      setNuevaPregunta(event.target.value)
                    }
                    placeholder="Escriba el texto de la nueva pregunta."
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <button
                  type="button"
                  className="admin-button admin-button--info"
                  onClick={handleAgregarPregunta}
                  disabled={
                    agregandoPregunta ||
                    guardando ||
                    !nuevaPregunta.trim()
                  }
                >
                  {agregandoPregunta
                    ? 'Agregando...'
                    : 'Agregar pregunta'}
                </button>
              </div>
            </section>
          </>
        )}
      </section>
    </AdminLayout>
  );
}
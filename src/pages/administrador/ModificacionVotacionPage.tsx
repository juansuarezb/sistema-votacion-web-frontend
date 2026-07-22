import { useEffect, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  createReferendumQuestion,
  getReferendumById,
  getReferendumQuestions,
  updateReferendum,
  updateReferendumQuestion,
  deleteReferendumQuestion,
  createReferendumCandidate,
  updateReferendumCandidate,
  deleteReferendumCandidate,
  type ReferendumQuestion,
} from '../../services/referendumService';
import ConfirmModal from '../../components/molecules/ConfirmModal';
import './AdminPages.css';

interface ModificacionVotacionPageProps {
  idReferendum: number;
  onLogout: () => void;
  onBack: () => void;
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
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: ModificacionVotacionPageProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
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

  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateImage, setNewCandidateImage] = useState('');
  const [addingCandidateTo, setAddingCandidateTo] = useState<number | null>(null);

  const [editingCandidate, setEditingCandidate] = useState<{idQuestion: number, idCandidate: number} | null>(null);
  const [editingCandidateName, setEditingCandidateName] = useState('');
  const [editingCandidateImage, setEditingCandidateImage] = useState('');
  
  const [isCandidateConfirmOpen, setIsCandidateConfirmOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<{idQuestion: number, idCandidate: number} | null>(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');

      const referendum = await getReferendumById(idReferendum);
      const questions = await getReferendumQuestions(idReferendum);

      setTitulo(referendum.titulo);
      setDescripcion(referendum.descripcion);
      setImagenUrl(referendum.imagenUrl ?? '');
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
        imagenUrl,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaCierre: new Date(fechaCierre).toISOString(),
        estado,
      });

      setMensaje('Votación actualizada correctamente.');
      await cargarDatos();
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

  const startEditing = (q: ReferendumQuestion) => {
    setEditingQuestionId(q.idQuestion);
    setEditingQuestionText(q.texto);
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setEditingQuestionText('');
  };

  const saveEditedQuestion = async (idQuestion: number) => {
    if (!editingQuestionText.trim()) {
      setError('El texto de la pregunta no puede estar vacío.');
      return;
    }
    try {
      setCargando(true);
      setError('');
      setMensaje('');
      
      await updateReferendumQuestion(idReferendum, idQuestion, { texto: editingQuestionText.trim() });
      
      await cargarDatos();
      setMensaje('Pregunta actualizada correctamente.');
      cancelEditing();
    } catch (err) {
      console.error('Error al actualizar pregunta:', err);
      if (err instanceof Error) {
        setError(`No se pudo actualizar la pregunta: ${err.message}`);
      } else {
        setError('No se pudo actualizar la pregunta.');
      }
      setCargando(false);
    }
  };

  const confirmDeleteQuestion = (idQuestion: number) => {
    setQuestionToDelete(idQuestion);
    setIsConfirmOpen(true);
  };

  const handleDeleteQuestion = async () => {
    if (questionToDelete === null) return;
    
    setIsConfirmOpen(false);
    try {
      setCargando(true);
      setError('');
      setMensaje('');
      
      await deleteReferendumQuestion(idReferendum, questionToDelete);
      
      await cargarDatos();
      setMensaje('Pregunta eliminada correctamente.');
    } catch (err) {
      console.error('Error al eliminar pregunta:', err);
      if (err instanceof Error) {
        setError(`No se pudo eliminar la pregunta: ${err.message}`);
      } else {
        setError('No se pudo eliminar la pregunta.');
      }
      setCargando(false);
    } finally {
      setQuestionToDelete(null);
    }
  };

  const handleAddCandidate = async (idQuestion: number) => {
    if (!newCandidateName.trim()) {
      setError('El nombre del candidato es obligatorio.');
      return;
    }
    try {
      setCargando(true);
      setError('');
      setMensaje('');
      
      await createReferendumCandidate(idReferendum, idQuestion, {
        nombre: newCandidateName.trim(),
        imagenUrl: newCandidateImage.trim() || undefined
      });
      
      setNewCandidateName('');
      setNewCandidateImage('');
      setAddingCandidateTo(null);
      await cargarDatos();
      setMensaje('Candidato agregado correctamente.');
    } catch (err) {
      console.error('Error al agregar candidato:', err);
      if (err instanceof Error) {
        setError(`No se pudo agregar el candidato: ${err.message}`);
      } else {
        setError('No se pudo agregar el candidato.');
      }
      setCargando(false);
    }
  };

  const startEditingCandidate = (idQuestion: number, c: any) => {
    setEditingCandidate({ idQuestion, idCandidate: c.idCandidate });
    setEditingCandidateName(c.nombre);
    setEditingCandidateImage(c.imagenUrl || '');
  };

  const cancelEditingCandidate = () => {
    setEditingCandidate(null);
    setEditingCandidateName('');
    setEditingCandidateImage('');
  };

  const saveEditedCandidate = async (idQuestion: number, idCandidate: number) => {
    if (!editingCandidateName.trim()) {
      setError('El nombre del candidato es obligatorio.');
      return;
    }
    try {
      setCargando(true);
      setError('');
      setMensaje('');
      
      await updateReferendumCandidate(idReferendum, idQuestion, idCandidate, {
        nombre: editingCandidateName.trim(),
        imagenUrl: editingCandidateImage.trim() || undefined
      });
      
      await cargarDatos();
      setMensaje('Candidato actualizado correctamente.');
      cancelEditingCandidate();
    } catch (err) {
      console.error('Error al actualizar candidato:', err);
      if (err instanceof Error) {
        setError(`No se pudo actualizar el candidato: ${err.message}`);
      } else {
        setError('No se pudo actualizar el candidato.');
      }
      setCargando(false);
    }
  };

  const confirmDeleteCandidate = (idQuestion: number, idCandidate: number) => {
    setCandidateToDelete({ idQuestion, idCandidate });
    setIsCandidateConfirmOpen(true);
  };

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    setIsCandidateConfirmOpen(false);
    try {
      setCargando(true);
      setError('');
      setMensaje('');
      
      await deleteReferendumCandidate(idReferendum, candidateToDelete.idQuestion, candidateToDelete.idCandidate);
      
      await cargarDatos();
      setMensaje('Candidato eliminado correctamente.');
    } catch (err) {
      console.error('Error al eliminar candidato:', err);
      if (err instanceof Error) {
        setError(`No se pudo eliminar el candidato: ${err.message}`);
      } else {
        setError('No se pudo eliminar el candidato.');
      }
      setCargando(false);
    } finally {
      setCandidateToDelete(null);
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
            <h2 className="admin-page__title">Editar Elección / Votación</h2>
            <p className="admin-page__description">
              Modifique la información general y administre las preguntas y candidatos de la elección.
            </p>
          </div>
        </div>

        {cargando && (
          <p className="admin-message admin-message--loading">
            Cargando elección...
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

              <div className="admin-form__group">
                <label htmlFor="imagenUrl">URL de Imagen (Opcional)</label>

                <input
                  id="imagenUrl"
                  type="url"
                  value={imagenUrl}
                  onChange={(event) => setImagenUrl(event.target.value)}
                  placeholder="Ej. https://ejemplo.com/imagen.jpg"
                  maxLength={1000}
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
                  <h3 className="admin-questions__title">Preguntas y Candidatos</h3>
                  <p className="admin-questions__description">
                    Preguntas (dignidades) actualmente registradas.
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {preguntas.map((pregunta) => (
                    <div key={pregunta.idQuestion} style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                        {editingQuestionId === pregunta.idQuestion ? (
                          <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
                            <input 
                              type="text" 
                              className="admin-select"
                              style={{ flexGrow: 1 }}
                              value={editingQuestionText} 
                              onChange={(e) => setEditingQuestionText(e.target.value)} 
                            />
                            <button type="button" className="admin-button admin-button--primary" onClick={() => saveEditedQuestion(pregunta.idQuestion)} style={{ padding: '6px 12px' }}>
                              Guardar
                            </button>
                            <button type="button" className="admin-button admin-button--secondary" onClick={cancelEditing} style={{ padding: '6px 12px' }}>
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <h4 style={{ margin: 0 }}>{pregunta.texto}</h4>
                            <div className="admin-actions" style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" className="admin-button admin-button--primary" onClick={() => startEditing(pregunta)} style={{ padding: '6px 12px', fontSize: '14px' }}>
                                Editar
                              </button>
                              <button type="button" className="admin-button" onClick={() => confirmDeleteQuestion(pregunta.idQuestion)} style={{ padding: '6px 12px', fontSize: '14px', backgroundColor: '#ef4444', color: 'white' }}>
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div style={{ paddingLeft: '20px', borderLeft: '3px solid var(--primary-color)' }}>
                        <h5 style={{ margin: '0 0 10px 0' }}>Candidatos registrados</h5>
                        {pregunta.candidatos && pregunta.candidatos.length > 0 ? (
                          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 15px 0' }}>
                            {pregunta.candidatos.map(c => (
                              <li key={c.idCandidate} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background-color)', padding: '10px', borderRadius: '4px', marginBottom: '5px' }}>
                                {editingCandidate?.idCandidate === c.idCandidate && editingCandidate?.idQuestion === pregunta.idQuestion ? (
                                  <div style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                                    <input type="text" style={{ flex: 1, padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Nombre" value={editingCandidateName} onChange={(e) => setEditingCandidateName(e.target.value)} />
                                    <input type="url" style={{ flex: 1, padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="URL de Imagen" value={editingCandidateImage} onChange={(e) => setEditingCandidateImage(e.target.value)} />
                                    <button type="button" className="admin-button admin-button--primary" onClick={() => saveEditedCandidate(pregunta.idQuestion, c.idCandidate)} style={{ padding: '4px 8px', fontSize: '12px' }}>Guardar</button>
                                    <button type="button" className="admin-button admin-button--secondary" onClick={cancelEditingCandidate} style={{ padding: '4px 8px', fontSize: '12px' }}>Cancelar</button>
                                  </div>
                                ) : (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      {c.imagenUrl ? (
                                        <img src={c.imagenUrl} alt={c.nombre} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '50%' }} />
                                      ) : (
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{fontSize: '10px'}}>N/A</span></div>
                                      )}
                                      <span>{c.nombre}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button type="button" className="admin-button admin-button--primary" onClick={() => startEditingCandidate(pregunta.idQuestion, c)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                                        Editar
                                      </button>
                                      <button type="button" className="admin-button" onClick={() => confirmDeleteCandidate(pregunta.idQuestion, c.idCandidate)} style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white' }}>
                                        Eliminar
                                      </button>
                                    </div>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="admin-message admin-message--empty" style={{ margin: '0 0 15px 0', fontSize: '14px' }}>No hay candidatos. Se usarán las opciones por defecto (Sí/No).</p>
                        )}

                        {addingCandidateTo === pregunta.idQuestion ? (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input type="text" style={{ flex: 1 }} placeholder="Nombre" value={newCandidateName} onChange={(e) => setNewCandidateName(e.target.value)} />
                            <input type="url" style={{ flex: 1 }} placeholder="URL de Imagen" value={newCandidateImage} onChange={(e) => setNewCandidateImage(e.target.value)} />
                            <button type="button" className="admin-button admin-button--primary" onClick={() => handleAddCandidate(pregunta.idQuestion)} style={{ padding: '6px 12px' }}>Guardar</button>
                            <button type="button" className="admin-button admin-button--secondary" onClick={() => setAddingCandidateTo(null)} style={{ padding: '6px 12px' }}>Cancelar</button>
                          </div>
                        ) : (
                          <button type="button" className="admin-button admin-button--info" onClick={() => setAddingCandidateTo(pregunta.idQuestion)} style={{ padding: '6px 12px', fontSize: '14px' }}>
                            + Añadir Candidato
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="admin-question-create" style={{ marginTop: '30px' }}>
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

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar Pregunta"
        message="¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={handleDeleteQuestion}
        onCancel={() => setIsConfirmOpen(false)}
        isDestructive={true}
      />
      <ConfirmModal
        isOpen={isCandidateConfirmOpen}
        title="Eliminar Candidato"
        message="¿Estás seguro de que deseas eliminar este candidato? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={handleDeleteCandidate}
        onCancel={() => setIsCandidateConfirmOpen(false)}
        isDestructive={true}
      />
    </AdminLayout>
  );
}
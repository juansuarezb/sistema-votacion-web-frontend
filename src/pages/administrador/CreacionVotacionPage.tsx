import { useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  createReferendum,
  createReferendumQuestion,
  createReferendumCandidate,
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

interface CandidateDraft {
  nombre: string;
  imagenUrl: string;
}

interface QuestionDraft {
  texto: string;
  candidatos: CandidateDraft[];
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
  const [imagenUrl, setImagenUrl] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');
  const [estado, setEstado] = useState('ACTIVO');
  
  const [preguntas, setPreguntas] = useState<QuestionDraft[]>([
    { texto: '', candidatos: [] }
  ]);
  
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setPreguntas([...preguntas, { texto: '', candidatos: [] }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const nuevas = [...preguntas];
    nuevas.splice(index, 1);
    setPreguntas(nuevas);
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const nuevas = [...preguntas];
    nuevas[index].texto = text;
    setPreguntas(nuevas);
  };

  const handleAddCandidate = (qIndex: number) => {
    const nuevas = [...preguntas];
    nuevas[qIndex].candidatos.push({ nombre: '', imagenUrl: '' });
    setPreguntas(nuevas);
  };

  const handleRemoveCandidate = (qIndex: number, cIndex: number) => {
    const nuevas = [...preguntas];
    nuevas[qIndex].candidatos.splice(cIndex, 1);
    setPreguntas(nuevas);
  };

  const handleCandidateChange = (qIndex: number, cIndex: number, field: keyof CandidateDraft, value: string) => {
    const nuevas = [...preguntas];
    nuevas[qIndex].candidatos[cIndex][field] = value;
    setPreguntas(nuevas);
  };

  const validar = () => {
    if (!titulo.trim()) return 'El título es obligatorio.';
    if (!descripcion.trim()) return 'La descripción es obligatoria.';
    if (!fechaInicio) return 'La fecha de inicio es obligatoria.';
    if (!fechaCierre) return 'La fecha de cierre es obligatoria.';

    if (new Date(fechaCierre) <= new Date(fechaInicio)) {
      return 'La fecha de cierre debe ser posterior a la fecha de inicio.';
    }

    if (preguntas.length === 0) return 'Debe ingresar al menos una pregunta.';
    
    for (let i = 0; i < preguntas.length; i++) {
      if (!preguntas[i].texto.trim()) return `El texto de la pregunta ${i+1} es obligatorio.`;
      
      for (let j = 0; j < preguntas[i].candidatos.length; j++) {
        if (!preguntas[i].candidatos[j].nombre.trim()) {
          return `El nombre del candidato ${j+1} en la pregunta ${i+1} es obligatorio.`;
        }
      }
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
        imagenUrl,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaCierre: new Date(fechaCierre).toISOString(),
        estado,
      });

      for (const questionDraft of preguntas) {
        const question = await createReferendumQuestion(referendum.idReferendum, {
          texto: questionDraft.texto.trim(),
        });
        
        for (const candDraft of questionDraft.candidatos) {
          await createReferendumCandidate(referendum.idReferendum, question.idQuestion, {
            nombre: candDraft.nombre.trim(),
            imagenUrl: candDraft.imagenUrl.trim() || undefined
          });
        }
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
            <h2 className="admin-page__title">Crear Elección / Votación</h2>
            <p className="admin-page__description">
              Configure la elección, su periodo de vigencia, las preguntas (dignidades) y sus candidatos.
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
              placeholder="Ej. Elecciones Generales 2026"
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
              placeholder="Describa brevemente el objetivo de la elección."
              maxLength={1000}
              rows={3}
              required
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="imagenUrl">URL de Imagen Principal (Opcional)</label>
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

          <hr style={{ margin: '30px 0', borderColor: 'var(--border-color)' }} />

          <h3 className="admin-questions__title" style={{ marginBottom: '15px' }}>Preguntas y Candidatos</h3>
          
          {preguntas.map((q, qIndex) => (
            <div key={qIndex} style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>Pregunta {qIndex + 1}</h4>
                {preguntas.length > 1 && (
                  <button type="button" className="admin-button admin-button--secondary" onClick={() => handleRemoveQuestion(qIndex)} style={{ padding: '6px 12px', fontSize: '14px' }}>
                    Eliminar Pregunta
                  </button>
                )}
              </div>
              
              <div className="admin-form__group">
                <input
                  type="text"
                  value={q.texto}
                  onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                  placeholder="Ej. ¿A quién elige para Presidente?"
                  required
                />
              </div>

              <div style={{ paddingLeft: '20px', borderLeft: '3px solid var(--primary-color)', marginTop: '20px' }}>
                <h5 style={{ margin: '0 0 15px 0' }}>Candidatos registrados</h5>
                
                {q.candidatos.length === 0 ? (
                  <p className="admin-message admin-message--empty" style={{ margin: '0 0 15px 0', fontSize: '14px' }}>No hay candidatos. Se usarán las opciones por defecto (Sí/No).</p>
                ) : (
                  q.candidatos.map((c, cIndex) => (
                    <div key={cIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        style={{ flex: 1 }}
                        placeholder="Nombre del candidato"
                        value={c.nombre}
                        onChange={(e) => handleCandidateChange(qIndex, cIndex, 'nombre', e.target.value)}
                        required
                      />
                      <input
                        type="url"
                        style={{ flex: 1 }}
                        placeholder="URL de foto (opcional)"
                        value={c.imagenUrl}
                        onChange={(e) => handleCandidateChange(qIndex, cIndex, 'imagenUrl', e.target.value)}
                      />
                      <button type="button" className="admin-action-btn admin-action-btn--delete" onClick={() => handleRemoveCandidate(qIndex, cIndex)}>
                        X
                      </button>
                    </div>
                  ))
                )}
                
                <button type="button" className="admin-button admin-button--info" onClick={() => handleAddCandidate(qIndex)} style={{ padding: '6px 12px', fontSize: '14px' }}>
                  + Añadir Candidato
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginBottom: '30px' }}>
            <button type="button" className="admin-button admin-button--secondary" onClick={handleAddQuestion}>
              + Añadir Otra Pregunta
            </button>
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
              {guardando ? 'Guardando...' : 'Guardar Elección'}
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
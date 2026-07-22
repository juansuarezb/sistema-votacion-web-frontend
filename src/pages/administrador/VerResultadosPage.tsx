import { useEffect, useState } from 'react';

import AdminLayout from '../../components/templates/AdminLayout';

import {
  getReferendums,
  getReferendumQuestions,
  type Referendum,
  type ReferendumQuestion,
} from '../../services/referendumService';

import {
  getResultsByReferendum,
  type ResultResponse,
} from '../../services/resultService';

import './AdminPages.css';

interface VerResultadosPageProps {
  idReferendumInicial?: number;
  onLogout: () => void;
  onBack?: () => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

const renderResultCell = (votos: number, porcentaje: number, color: string) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '90px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontWeight: 600, fontSize: '16px', color: '#111827' }}>{votos}</span>
      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{porcentaje}%</span>
    </div>
    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
      <div 
        style={{ 
          width: `${porcentaje}%`, 
          height: '100%', 
          backgroundColor: color, 
          borderRadius: '999px', 
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
        }} 
      />
    </div>
  </div>
);

export default function VerResultadosPage({
  idReferendumInicial,
  onLogout,
  onBack,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: VerResultadosPageProps) {
  const [referendums, setReferendums] = useState<Referendum[]>([]);
  const [preguntas, setPreguntas] = useState<ReferendumQuestion[]>([]);

  const [idReferendum, setIdReferendum] = useState(
    idReferendumInicial?.toString() ?? ''
  );

  const [resultado, setResultado] =
    useState<ResultResponse | null>(null);

  const [cargando, setCargando] = useState(true);
  const [consultando, setConsultando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarReferendums() {
      try {
        setCargando(true);
        setError('');

        const data = await getReferendums();
        setReferendums(data);

        if (!idReferendumInicial && data.length > 0) {
          setIdReferendum(data[0].idReferendum.toString());
        }
      } catch (err) {
        console.error('Error al cargar referéndums:', err);

        if (err instanceof Error) {
          setError(
            'No se pudieron cargar las votaciones: ${err.message}'
          );
        } else {
          setError('No se pudieron cargar las votaciones.');
        }
      } finally {
        setCargando(false);
      }
    }

    void cargarReferendums();
  }, [idReferendumInicial]);

  useEffect(() => {
    if (!idReferendum) {
      setResultado(null);
      setPreguntas([]);
      return;
    }

    async function consultarResultados(id: number) {
      try {
        setConsultando(true);
        setError('');

        const [resultsData, questionsData] = await Promise.all([
          getResultsByReferendum(id),
          getReferendumQuestions(id),
        ]);

        setResultado(resultsData);
        setPreguntas(questionsData);
      } catch (err) {
        console.error('Error al consultar resultados:', err);

        setResultado(null);
        setPreguntas([]);

        if (err instanceof Error) {
          setError(
            'No se pudieron consultar los resultados: ${err.message}'
          );
        } else {
          setError('No se pudieron consultar los resultados.');
        }
      } finally {
        setConsultando(false);
      }
    }

    void consultarResultados(Number(idReferendum));
  }, [idReferendum]);

  const referendumSeleccionado = referendums.find(
    (referendum) =>
      referendum.idReferendum === Number(idReferendum)
  );

  const obtenerTextoPregunta = (idQuestion: number): string => {
    const pregunta = preguntas.find(
      (item) => item.idQuestion === idQuestion
    );

    return pregunta?.texto ?? `Pregunta ${idQuestion}`;
  };

  return (
    <AdminLayout
      welcomeName="Admin"
      activeSection="resultados"
      onLogout={onLogout}
      onGoToVotantes={onGoToVotantes}
      onGoToVotaciones={onGoToVotaciones}
      onGoToResultados={onGoToResultados}
    >
      <section className="admin-page">
        <div className="admin-page__header">
          <div>
            <h2 className="admin-page__title">Resultados</h2>

            <p className="admin-page__description">
              Consulta el resumen de votos por pregunta de cada referéndum.
            </p>
          </div>
        </div>

        {cargando && (
          <p className="admin-message admin-message--loading">
            Cargando votaciones...
          </p>
        )}

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {!cargando && referendums.length === 0 && (
          <p className="admin-message admin-message--empty">
            No existen votaciones registradas.
          </p>
        )}

        {!cargando && referendums.length > 0 && (
          <>
            <div className="admin-field">
              <label
                htmlFor="referendum-resultados"
                className="admin-field__label"
              >
                Seleccione una votación
              </label>

              <select
                id="referendum-resultados"
                className="admin-select"
                value={idReferendum}
                onChange={(event) =>
                  setIdReferendum(event.target.value)
                }
              >
                {referendums.map((referendum) => (
                  <option
                    key={referendum.idReferendum}
                    value={referendum.idReferendum}
                  >
                    {referendum.titulo}
                  </option>
                ))}
              </select>
            </div>

            {consultando && (
              <p className="admin-message admin-message--loading">
                Consultando resultados...
              </p>
            )}

            {!consultando && resultado && (
              <div className="admin-results-summary">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                  {referendumSeleccionado && (
                    <div style={{ flex: '1 1 min-content' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                        {referendumSeleccionado.titulo}
                      </h3>
                      <p style={{ margin: 0, color: '#475569', fontSize: '16px' }}>
                        Desglose de participación y respuestas por pregunta.
                      </p>
                    </div>
                  )}

                  <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', textAlign: 'center', minWidth: '160px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Participación</p>
                    <p style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 900, color: '#0d47a1', lineHeight: 1 }}>{resultado.totalVotes}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Votos Registrados</p>
                  </div>
                </div>

                {resultado.questions.length === 0 ? (
                  <p className="admin-message admin-message--empty">
                    Todavía no existen votos registrados para este
                    referéndum.
                  </p>
                ) : (
                  <div className="admin-table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <table className="admin-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Pregunta</th>
                          <th style={{ backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>SÍ</th>
                          <th style={{ backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>NO</th>
                          <th style={{ backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>BLANCO</th>
                          <th style={{ backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>NULO</th>
                          <th style={{ backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {resultado.questions.map((question) => (
                          <tr key={question.idQuestion}>
                            <td className="admin-table__description" style={{ fontWeight: 500, color: '#1f2937' }}>
                              {obtenerTextoPregunta(question.idQuestion)}
                            </td>

                            <td className="admin-result-number">
                              {renderResultCell(question.si, question.porcentajeSi, '#16a34a')}
                            </td>

                            <td className="admin-result-number">
                              {renderResultCell(question.no, question.porcentajeNo, '#dc2626')}
                            </td>

                            <td className="admin-result-number">
                              {renderResultCell(question.blanco, question.porcentajeBlanco, '#94a3b8')}
                            </td>

                            <td className="admin-result-number">
                              {renderResultCell(question.nulo, question.porcentajeNulo, '#64748b')}
                            </td>

                            <td className="admin-result-number admin-result-total" style={{ fontSize: '20px' }}>
                              {question.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {onBack && (
              <div className="admin-page__footer">
                <button
                  type="button"
                  className="admin-button admin-button--back"
                  onClick={onBack}
                >
                  Volver
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </AdminLayout>
  );
}
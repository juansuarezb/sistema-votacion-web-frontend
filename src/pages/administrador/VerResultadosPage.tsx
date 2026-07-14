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
                {referendumSeleccionado && (
                  <p className="admin-page__description">
                    Resultados de:{' '}
                    <strong>{referendumSeleccionado.titulo}</strong>
                  </p>
                )}

                <p className="admin-result-total">
                  Total de respuestas registradas: {resultado.totalVotes}
                </p>

                {resultado.questions.length === 0 ? (
                  <p className="admin-message admin-message--empty">
                    Todavía no existen votos registrados para este
                    referéndum.
                  </p>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Pregunta</th>
                          <th>SÍ</th>
                          <th>NO</th>
                          <th>BLANCO</th>
                          <th>NULO</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {resultado.questions.map((question) => (
                          <tr key={question.idQuestion}>
                            <td className="admin-table__description">
                              {obtenerTextoPregunta(question.idQuestion)}
                            </td>

                            <td className="admin-result-number">
                              {question.si}
                              <br />
                              <small>{question.porcentajeSi}%</small>
                            </td>

                            <td className="admin-result-number">
                              {question.no}
                              <br />
                              <small>{question.porcentajeNo}%</small>
                            </td>

                            <td className="admin-result-number">
                              {question.blanco}
                              <br />
                              <small>{question.porcentajeBlanco}%</small>
                            </td>

                            <td className="admin-result-number">
                              {question.nulo}
                              <br />
                              <small>{question.porcentajeNulo}%</small>
                            </td>

                            <td className="admin-result-number admin-result-total">
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
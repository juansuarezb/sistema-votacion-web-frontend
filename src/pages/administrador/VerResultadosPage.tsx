import { useEffect, useState } from 'react';

import AdminLayout from '../../components/templates/AdminLayout';

import {
  getReferendums,
  type Referendum,
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
  const [referendums, setReferendums] =
    useState<Referendum[]>([]);

  const [idReferendum, setIdReferendum] =
    useState(
      idReferendumInicial?.toString() ?? ''
    );

  const [resultado, setResultado] =
    useState<ResultResponse | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [consultando, setConsultando] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function cargarReferendums() {
      try {
        setCargando(true);
        setError('');

        const data = await getReferendums();
        setReferendums(data);

        if (
          !idReferendumInicial &&
          data.length > 0
        ) {
          setIdReferendum(
            data[0].idReferendum.toString()
          );
        }
      } catch (err) {
        console.error(
          'Error al cargar referéndums:',
          err
        );

        if (err instanceof Error) {
          setError(
            `No se pudieron cargar las votaciones: ${err.message}`
          );
        } else {
          setError(
            'No se pudieron cargar las votaciones.'
          );
        }
      } finally {
        setCargando(false);
      }
    }

    cargarReferendums();
  }, [idReferendumInicial]);

  useEffect(() => {
    if (idReferendum) {
      consultarResultados(
        Number(idReferendum)
      );
    }
  }, [idReferendum]);

  const consultarResultados = async (
    id: number
  ) => {
    try {
      setConsultando(true);
      setError('');

      const data =
        await getResultsByReferendum(id);

      setResultado(data);
    } catch (err) {
      console.error(
        'Error al consultar resultados:',
        err
      );

      setResultado(null);

      if (err instanceof Error) {
        setError(
          `No se pudieron consultar los resultados: ${err.message}`
        );
      } else {
        setError(
          'No se pudieron consultar los resultados.'
        );
      }
    } finally {
      setConsultando(false);
    }
  };

  const referendumSeleccionado =
    referendums.find(
      (referendum) =>
        referendum.idReferendum ===
        Number(idReferendum)
    );

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
            <h2 className="admin-page__title">
              Resultados
            </h2>

            <p className="admin-page__description">
              Consulta el resumen de votos de cada
              referéndum.
            </p>
          </div>
        </div>

        {cargando && (
          <p className="admin-message admin-message--loading">
            Cargando votaciones...
          </p>
        )}

        {error && (
          <p className="admin-error">
            {error}
          </p>
        )}

        {!cargando &&
          referendums.length === 0 && (
            <p className="admin-message admin-message--empty">
              No existen votaciones registradas.
            </p>
          )}

        {!cargando &&
          referendums.length > 0 && (
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
                    setIdReferendum(
                      event.target.value
                    )
                  }
                >
                  {referendums.map(
                    (referendum) => (
                      <option
                        key={
                          referendum.idReferendum
                        }
                        value={
                          referendum.idReferendum
                        }
                      >
                        {referendum.titulo}
                      </option>
                    )
                  )}
                </select>
              </div>

              {consultando && (
                <p className="admin-message admin-message--loading">
                  Consultando resultados...
                </p>
              )}

              {!consultando &&
                resultado && (
                  <div className="admin-results-summary">
                    {referendumSeleccionado && (
                      <p className="admin-page__description">
                        Resultados de:
                        {' '}
                        <strong>
                          {
                            referendumSeleccionado.titulo
                          }
                        </strong>
                      </p>
                    )}

                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Referéndum</th>
                            <th>SÍ</th>
                            <th>NO</th>
                            <th>BLANCO</th>
                            <th>NULO</th>
                            <th>Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>
                              {
                                resultado.idReferendum
                              }
                            </td>

                            <td className="admin-result-number">
                              {resultado.totalSi}
                            </td>

                            <td className="admin-result-number">
                              {resultado.totalNo}
                            </td>

                            <td className="admin-result-number">
                              {
                                resultado.totalBlanco
                              }
                            </td>

                            <td className="admin-result-number">
                              {
                                resultado.totalNulo
                              }
                            </td>

                            <td className="admin-result-number admin-result-total">
                              {
                                resultado.totalVotos
                              }
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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
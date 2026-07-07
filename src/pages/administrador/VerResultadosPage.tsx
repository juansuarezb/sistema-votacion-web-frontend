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
  const [idReferendum, setIdReferendum] = useState(
    idReferendumInicial?.toString() ?? ''
  );
  const [resultado, setResultado] = useState<ResultResponse | null>(null);
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
        console.error('Error al cargar referendums:', err);

        if (err instanceof Error) {
          setError(`No se pudieron cargar las votaciones: ${err.message}`);
        } else {
          setError('No se pudieron cargar las votaciones.');
        }
      } finally {
        setCargando(false);
      }
    }

    cargarReferendums();
  }, [idReferendumInicial]);

  useEffect(() => {
    if (idReferendum) {
      consultarResultados(Number(idReferendum));
    }
  }, [idReferendum]);

  const consultarResultados = async (id: number) => {
    try {
      setConsultando(true);
      setError('');

      const data = await getResultsByReferendum(id);
      setResultado(data);
    } catch (err) {
      console.error('Error al consultar resultados:', err);

      setResultado(null);

      if (err instanceof Error) {
        setError(`No se pudieron consultar los resultados: ${err.message}`);
      } else {
        setError('No se pudieron consultar los resultados.');
      }
    } finally {
      setConsultando(false);
    }
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
      <h2>Resultados</h2>

      {cargando && <p>Cargando votaciones...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!cargando && referendums.length === 0 && (
        <p>No existen votaciones registradas.</p>
      )}

      {!cargando && referendums.length > 0 && (
        <>
          <div>
            <label>Seleccione una votación</label>
            <br />
            <select
              value={idReferendum}
              onChange={(event) => setIdReferendum(event.target.value)}
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

          {consultando && <p>Consultando resultados...</p>}

          {resultado && (
            <table border={1} cellPadding={8} style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Referéndum</th>
                  <th>SI</th>
                  <th>NO</th>
                  <th>BLANCO</th>
                  <th>NULO</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>{resultado.idReferendum}</td>
                  <td>{resultado.totalSi}</td>
                  <td>{resultado.totalNo}</td>
                  <td>{resultado.totalBlanco}</td>
                  <td>{resultado.totalNulo}</td>
                  <td>{resultado.totalVotos}</td>
                </tr>
              </tbody>
            </table>
          )}

          <br />

          {onBack && (
            <button type="button" onClick={onBack}>
              Volver
            </button>
          )}
        </>
      )}
    </AdminLayout>
  );
}
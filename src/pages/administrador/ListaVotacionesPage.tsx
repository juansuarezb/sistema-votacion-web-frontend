import { useEffect, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  deleteReferendum,
  getReferendums,
  type Referendum,
} from '../../services/referendumService';

interface ListaVotacionesPageProps {
  onLogout: () => void;
  onGoToCreate: () => void;
  onGoToEdit: (idReferendum: number) => void;
  onGoToAssign: (idReferendum: number) => void;
  onGoToResults: (idReferendum: number) => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

export default function ListaVotacionesPage({
  onLogout,
  onGoToCreate,
  onGoToEdit,
  onGoToAssign,
  onGoToResults,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: ListaVotacionesPageProps) {
  const [referendums, setReferendums] = useState<Referendum[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarReferendums = async () => {
    try {
      setCargando(true);
      setError('');

      const data = await getReferendums();
      setReferendums(data);
    } catch (err) {
      console.error('Error al cargar votaciones:', err);

      if (err instanceof Error) {
        setError(`No se pudieron cargar las votaciones: ${err.message}`);
      } else {
        setError('No se pudieron cargar las votaciones.');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReferendums();
  }, []);

  const handleEliminar = async (idReferendum: number) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar esta votación?'
    );

    if (!confirmar) return;

    try {
      await deleteReferendum(idReferendum);
      await cargarReferendums();
    } catch (err) {
      console.error('Error al eliminar votación:', err);

      if (err instanceof Error) {
        alert(`No se pudo eliminar la votación: ${err.message}`);
      } else {
        alert('No se pudo eliminar la votación.');
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
      <h2>Gestión de Votaciones</h2>

      <button type="button" onClick={onGoToCreate}>
        Nueva Votación
      </button>

      {cargando && <p>Cargando votaciones...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!cargando && !error && referendums.length === 0 && (
        <p>No existen votaciones registradas.</p>
      )}

      {!cargando && !error && referendums.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Inicio</th>
              <th>Cierre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {referendums.map((referendum) => (
              <tr key={referendum.idReferendum}>
                <td>{referendum.idReferendum}</td>
                <td>{referendum.titulo}</td>
                <td>{referendum.descripcion}</td>
                <td>{new Date(referendum.fechaInicio).toLocaleString()}</td>
                <td>{new Date(referendum.fechaCierre).toLocaleString()}</td>
                <td>{referendum.estado}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onGoToEdit(referendum.idReferendum)}
                  >
                    Editar
                  </button>

                  {' '}

                  <button
                    type="button"
                    onClick={() => onGoToAssign(referendum.idReferendum)}
                  >
                    Asignar
                  </button>

                  {' '}

                  <button
                    type="button"
                    onClick={() => onGoToResults(referendum.idReferendum)}
                  >
                    Resultados
                  </button>

                  {' '}

                  <button
                    type="button"
                    onClick={() => handleEliminar(referendum.idReferendum)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
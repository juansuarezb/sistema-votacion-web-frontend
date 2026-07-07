import { useEffect, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import './AdminPages.css';
import {
  deleteVotante,
  getVotantes,
  type Votante,
} from '../../services/voterService';

interface ListaVotantesPageProps {
  onLogout: () => void;
  onGoToCreate: () => void;
  onGoToEdit: (idVotante: number) => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

export default function ListaVotantesPage({
  onLogout,
  onGoToCreate,
  onGoToEdit,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: ListaVotantesPageProps) {
  const [votantes, setVotantes] = useState<Votante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarVotantes = async () => {
    try {
      setCargando(true);
      setError('');

      const data = await getVotantes();
      setVotantes(data);
    } catch (err) {
      console.error('Error al cargar votantes:', err);

      if (err instanceof Error) {
        setError(`No se pudieron cargar los votantes: ${err.message}`);
      } else {
        setError('No se pudieron cargar los votantes.');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVotantes();
  }, []);

  const handleEliminar = async (idVotante: number) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar este votante?'
    );

    if (!confirmar) return;

    try {
      await deleteVotante(idVotante);
      await cargarVotantes();
    } catch (err) {
      console.error('Error al eliminar votante:', err);

      if (err instanceof Error) {
        alert(`No se pudo eliminar el votante: ${err.message}`);
      } else {
        alert('No se pudo eliminar el votante.');
      }
    }
  };

return (
  <AdminLayout
    welcomeName="Admin"
    activeSection="votantes"
    onLogout={onLogout}
    onGoToVotantes={onGoToVotantes}
    onGoToVotaciones={onGoToVotaciones}
    onGoToResultados={onGoToResultados}
  >
    <section className="admin-page">
      <div className="admin-page__header">
        <h2 className="admin-page__title">Gestión de Votantes</h2>

        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={onGoToCreate}
        >
          Nuevo Votante
        </button>
      </div>

      {cargando && <p>Cargando votantes...</p>}

      {error && <p className="admin-error">{error}</p>}

      {!cargando && !error && votantes.length === 0 && (
        <p>No existen votantes registrados.</p>
      )}

      {!cargando && !error && votantes.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Keycloak ID</th>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Correo</th>
              <th>Fecha registro</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {votantes.map((votante) => (
              <tr key={votante.idVotante}>
                <td>{votante.idVotante}</td>
                <td>{votante.keycloakId}</td>
                <td>{votante.nombre}</td>
                <td>{votante.cedula}</td>
                <td>{votante.correoElectronico}</td>
                <td>{new Date(votante.fechaRegistro).toLocaleString()}</td>
                <td>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-button admin-button--secondary"
                      onClick={() => onGoToEdit(votante.idVotante)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="admin-button admin-button--danger"
                      onClick={() => handleEliminar(votante.idVotante)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  </AdminLayout>
);
}
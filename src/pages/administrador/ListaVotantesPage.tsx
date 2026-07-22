import { useEffect, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import Icon from '../../components/atoms/Icon';
import ConfirmModal from '../../components/molecules/ConfirmModal';
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
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [votanteToDelete, setVotanteToDelete] = useState<number | null>(null);

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

  const confirmEliminar = (idVotante: number) => {
    setVotanteToDelete(idVotante);
    setIsConfirmOpen(true);
  };

  const handleEliminar = async () => {
    if (votanteToDelete === null) return;
    
    setIsConfirmOpen(false);
    try {
      await deleteVotante(votanteToDelete);
      await cargarVotantes();
    } catch (err) {
      console.error('Error al eliminar votante:', err);

      if (err instanceof Error) {
        alert(`No se pudo eliminar el votante: ${err.message}`);
      } else {
        alert('No se pudo eliminar el votante.');
      }
    } finally {
      setVotanteToDelete(null);
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
          <div>
            <h2 className="admin-page__title">Gestión de Votantes</h2>
            <p className="admin-page__description">
              Administra el padrón electoral de tu jurisdicción.
            </p>
          </div>

          <button
            type="button"
            className="admin-button admin-button--primary"
            onClick={onGoToCreate}
          >
            <Icon name="person" alt="" size={20} />
            <span style={{ marginLeft: '8px' }}>Nuevo Votante</span>
          </button>
        </div>

        {cargando && <div className="admin-message admin-message--loading">Cargando votantes...</div>}

        {error && <div className="admin-error">{error}</div>}

        {!cargando && !error && votantes.length === 0 && (
          <div className="admin-message admin-message--empty">No existen votantes registrados.</div>
        )}

        {!cargando && !error && votantes.length > 0 && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th>Fecha de Registro</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {votantes.map((votante) => (
                  <tr key={votante.idVotante}>
                    <td style={{ fontWeight: '600' }}>{votante.cedula}</td>
                    <td>{votante.nombre}</td>
                    <td>{votante.correoElectronico}</td>
                    <td className="admin-table__date">
                      {new Date(votante.fechaRegistro).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="admin-actions admin-actions--center">
                        <button
                          type="button"
                          className="admin-action-btn admin-action-btn--edit"
                          onClick={() => onGoToEdit(votante.idVotante)}
                          title="Editar votante"
                        >
                          <Icon name="person" alt="Editar" size={24} />
                        </button>

                        <button
                          type="button"
                          className="admin-action-btn admin-action-btn--delete"
                          onClick={() => confirmEliminar(votante.idVotante)}
                          title="Eliminar votante"
                        >
                          <Icon name="exit" alt="Eliminar" size={24} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar Votante"
        message="¿Estás seguro de que deseas eliminar este votante? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={handleEliminar}
        onCancel={() => setIsConfirmOpen(false)}
        isDestructive={true}
      />
    </AdminLayout>
  );
}
import { useEffect, useState } from 'react';

import AdminLayout from '../../components/templates/AdminLayout';

import {
  deleteReferendum,
  getReferendums,
  type Referendum,
} from '../../services/referendumService';

import './AdminPages.css';

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
        setError(
          `No se pudieron cargar las votaciones: ${err.message}`
        );
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

  const handleEliminar = async (
    idReferendum: number
  ) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar esta votación?'
    );

    if (!confirmar) {
      return;
    }

    try {
      await deleteReferendum(idReferendum);
      await cargarReferendums();
    } catch (err) {
      console.error(
        'Error al eliminar votación:',
        err
      );

      if (err instanceof Error) {
        alert(
          `No se pudo eliminar la votación: ${err.message}`
        );
      } else {
        alert('No se pudo eliminar la votación.');
      }
    }
  };

  const getStatusClassName = (
    estado: string
  ): string => {
    const normalizedStatus =
      estado.trim().toLowerCase();

    switch (normalizedStatus) {
      case 'activo':
        return 'admin-status admin-status--activo';

      case 'borrador':
        return 'admin-status admin-status--borrador';

      case 'cerrado':
        return 'admin-status admin-status--cerrado';

      case 'cancelado':
        return 'admin-status admin-status--cancelado';

      default:
        return 'admin-status admin-status--borrador';
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
            <h2 className="admin-page__title">
              Gestión de Votaciones
            </h2>

            <p className="admin-page__description">
              Administra los referéndums, sus asignaciones y
              resultados.
            </p>
          </div>

          <button
            type="button"
            className="admin-button admin-button--primary"
            onClick={onGoToCreate}
          >
            Nueva Votación
          </button>
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
          !error &&
          referendums.length === 0 && (
            <p className="admin-message admin-message--empty">
              No existen votaciones registradas.
            </p>
          )}

        {!cargando &&
          !error &&
          referendums.length > 0 && (
            <div className="admin-table-container">
              <table className="admin-table">
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
                  {referendums.map(
                    (referendum) => (
                      <tr
                        key={
                          referendum.idReferendum
                        }
                      >
                        <td>
                          {referendum.idReferendum}
                        </td>

                        <td>
                          <strong>
                            {referendum.titulo}
                          </strong>
                        </td>

                        <td className="admin-table__description">
                          {referendum.descripcion}
                        </td>

                        <td className="admin-table__date">
                          {new Date(
                            referendum.fechaInicio
                          ).toLocaleString()}
                        </td>

                        <td className="admin-table__date">
                          {new Date(
                            referendum.fechaCierre
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className={getStatusClassName(
                              referendum.estado
                            )}
                          >
                            {referendum.estado}
                          </span>
                        </td>

                        <td className="admin-table__actions">
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="admin-button admin-button--secondary"
                              onClick={() =>
                                onGoToEdit(
                                  referendum.idReferendum
                                )
                              }
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="admin-button admin-button--info"
                              onClick={() =>
                                onGoToAssign(
                                  referendum.idReferendum
                                )
                              }
                            >
                              Asignar
                            </button>

                            <button
                              type="button"
                              className="admin-button admin-button--primary"
                              onClick={() =>
                                onGoToResults(
                                  referendum.idReferendum
                                )
                              }
                            >
                              Resultados
                            </button>

                            <button
                              type="button"
                              className="admin-button admin-button--danger"
                              onClick={() =>
                                handleEliminar(
                                  referendum.idReferendum
                                )
                              }
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </AdminLayout>
  );
}
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import {
  getVotanteById,
  updateVotante,
} from '../../services/voterService';

interface ModificacionVotantePageProps {
  idVotante: number;
  onLogout: () => void;
  onBack: () => void;
  onUpdated: () => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

export default function ModificacionVotantePage({
  idVotante,
  onLogout,
  onBack,
  onUpdated,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: ModificacionVotantePageProps) {
  const [keycloakId, setKeycloakId] = useState('');
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarVotante() {
      try {
        setCargando(true);
        setError('');

        const votante = await getVotanteById(idVotante);

        setKeycloakId(votante.keycloakId);
        setNombre(votante.nombre);
        setCedula(votante.cedula);
        setCorreoElectronico(votante.correoElectronico);
      } catch (err) {
        console.error('Error al cargar votante:', err);

        if (err instanceof Error) {
          setError(`No se pudo cargar el votante: ${err.message}`);
        } else {
          setError('No se pudo cargar el votante.');
        }
      } finally {
        setCargando(false);
      }
    }

    cargarVotante();
  }, [idVotante]);

  const validar = () => {
    if (!keycloakId.trim()) return 'El Keycloak ID es obligatorio.';
    if (!nombre.trim()) return 'El nombre es obligatorio.';
    if (!cedula.trim()) return 'La cédula es obligatoria.';
    if (!/^\d+$/.test(cedula)) return 'La cédula solo debe contener números.';
    if (cedula.length !== 10) return 'La cédula debe tener 10 dígitos.';
    if (!correoElectronico.trim()) return 'El correo es obligatorio.';
    if (!correoElectronico.includes('@')) return 'El correo no es válido.';

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

      await updateVotante(idVotante, {
        keycloakId,
        nombre,
        cedula,
        correoElectronico,
      });

      onUpdated();
    } catch (err) {
      console.error('Error al actualizar votante:', err);

      if (err instanceof Error) {
        setError(`No se pudo actualizar el votante: ${err.message}`);
      } else {
        setError('No se pudo actualizar el votante.');
      }
    } finally {
      setGuardando(false);
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
        <h2 className="admin-page__title">Editar Votante</h2>
      </div>

      {cargando && <p>Cargando votante...</p>}

      {!cargando && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__group">
            <label>Keycloak ID</label>
            <input
              value={keycloakId}
              onChange={(event) => setKeycloakId(event.target.value)}
              required
            />
          </div>

          <div className="admin-form__group">
            <label>Nombre</label>
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
            />
          </div>

          <div className="admin-form__group">
            <label>Cédula</label>
            <input
              value={cedula}
              onChange={(event) => setCedula(event.target.value)}
              required
              maxLength={10}
            />
          </div>

          <div className="admin-form__group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={correoElectronico}
              onChange={(event) => setCorreoElectronico(event.target.value)}
              required
            />
          </div>

          {error && <p className="admin-error">{error}</p>}

          <div className="admin-actions">
            <button
              type="submit"
              className="admin-button admin-button--primary"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Actualizar'}
            </button>

            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={onBack}
            >
              Volver
            </button>
          </div>
        </form>
      )}
    </section>
  </AdminLayout>
);
}
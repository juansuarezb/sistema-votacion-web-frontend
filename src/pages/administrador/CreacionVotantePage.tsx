import { useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import { createVotante } from '../../services/voterService';

interface CreacionVotantePageProps {
  onLogout: () => void;
  onBack: () => void;
  onCreated: () => void;
  onGoToVotantes: () => void;
  onGoToVotaciones: () => void;
  onGoToResultados: () => void;
}

export default function CreacionVotantePage({
  onLogout,
  onBack,
  onCreated,
  onGoToVotantes,
  onGoToVotaciones,
  onGoToResultados,
}: CreacionVotantePageProps) {
  const [keycloakId, setKeycloakId] = useState('');
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

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

      await createVotante({
        keycloakId,
        nombre,
        cedula,
        correoElectronico,
      });

      onCreated();
    } catch (err) {
      console.error('Error al crear votante:', err);

      if (err instanceof Error) {
        setError(`No se pudo crear el votante: ${err.message}`);
      } else {
        setError('No se pudo crear el votante.');
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
        <h2 className="admin-page__title">Crear Votante</h2>
      </div>

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
            {guardando ? 'Guardando...' : 'Guardar'}
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
    </section>
  </AdminLayout>
);
}
import { useState } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import { registerVotante } from '../../services/voterService';

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
  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const validar = (): string => {
    if (!username.trim()) {
      return 'El nombre de usuario es obligatorio.';
    }

    if (username.trim().length < 4) {
      return 'El nombre de usuario debe tener al menos 4 caracteres.';
    }

    if (!nombre.trim()) {
      return 'El nombre es obligatorio.';
    }

    if (!cedula.trim()) {
      return 'La cédula es obligatoria.';
    }

    if (!/^\d+$/.test(cedula)) {
      return 'La cédula solo debe contener números.';
    }

    if (cedula.length !== 10) {
      return 'La cédula debe tener 10 dígitos.';
    }

    if (!correoElectronico.trim()) {
      return 'El correo es obligatorio.';
    }

    if (!correoElectronico.includes('@')) {
      return 'El correo no es válido.';
    }

    if (!password) {
      return 'La contraseña es obligatoria.';
    }

    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (password !== confirmarPassword) {
      return 'Las contraseñas no coinciden.';
    }

    return '';
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationError = validar();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setGuardando(true);
      setError('');

      await registerVotante({
        username: username.trim(),
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        correoElectronico: correoElectronico.trim(),
        password,
      });

      onCreated();
    } catch (err) {
      console.error('Error al registrar votante:', err);

      if (err instanceof Error) {
        setError(
          `No se pudo registrar el votante: ${err.message}`
        );
      } else {
        setError('No se pudo registrar el votante.');
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
          <h2 className="admin-page__title">
            Crear Votante
          </h2>
        </div>

        <form
          className="admin-form"
          onSubmit={handleSubmit}
        >
          <div className="admin-form__group">
            <label htmlFor="username">
              Nombre de usuario
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              autoComplete="username"
              disabled={guardando}
              required
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="nombre">
              Nombre completo
            </label>

            <input
              id="nombre"
              name="nombre"
              type="text"
              value={nombre}
              onChange={(event) =>
                setNombre(event.target.value)
              }
              autoComplete="name"
              disabled={guardando}
              required
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="cedula">
              Cédula
            </label>

            <input
              id="cedula"
              name="cedula"
              type="text"
              inputMode="numeric"
              value={cedula}
              onChange={(event) =>
                setCedula(
                  event.target.value.replace(/\D/g, '')
                )
              }
              maxLength={10}
              disabled={guardando}
              required
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="correoElectronico">
              Correo electrónico
            </label>

            <input
              id="correoElectronico"
              name="correoElectronico"
              type="email"
              value={correoElectronico}
              onChange={(event) =>
                setCorreoElectronico(event.target.value)
              }
              autoComplete="email"
              disabled={guardando}
              required
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              disabled={guardando}
              required
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="confirmarPassword">
              Confirmar contraseña
            </label>

            <input
              id="confirmarPassword"
              name="confirmarPassword"
              type="password"
              value={confirmarPassword}
              onChange={(event) =>
                setConfirmarPassword(event.target.value)
              }
              autoComplete="new-password"
              disabled={guardando}
              required
            />
          </div>

          {error && (
            <p className="admin-error">
              {error}
            </p>
          )}

          <div className="admin-actions">
            <button
              type="submit"
              className="admin-button admin-button--primary"
              disabled={guardando}
            >
              {guardando
                ? 'Registrando...'
                : 'Registrar votante'}
            </button>

            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={onBack}
              disabled={guardando}
            >
              Volver
            </button>
          </div>
        </form>
      </section>
    </AdminLayout>
  );
}
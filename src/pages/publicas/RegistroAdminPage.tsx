import { useState } from 'react';

import AuthLayout from '../../components/templates/AuthLayout';
import AuthCard from '../../components/organisms/AuthCard';
import TextField from '../../components/atoms/TextField';
import PasswordField from '../../components/molecules/PasswordField';
import Button from '../../components/atoms/Button';

import { registerAdmin } from '../../services/authService';

interface RegistroAdminPageProps {
  onBack: () => void;
  onRegistered: () => void;
}

export default function RegistroAdminPage({
  onBack,
  onRegistered,
}: RegistroAdminPageProps) {
  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const validar = (): string => {
    if (!username.trim()) {
      return 'El nombre de usuario es obligatorio.';
    }

    if (username.trim().length < 4) {
      return 'El nombre de usuario debe tener al menos 4 caracteres.';
    }

    if (!nombre.trim()) {
      return 'El nombre completo es obligatorio.';
    }

    if (!correoElectronico.trim()) {
      return 'El correo electrónico es obligatorio.';
    }

    if (!correoElectronico.includes('@')) {
      return 'El correo electrónico no es válido.';
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
      setMensaje('');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      setMensaje('');

      const response = await registerAdmin({
        username: username.trim(),
        nombre: nombre.trim(),
        correoElectronico: correoElectronico.trim(),
        password,
      });

      setMensaje(response.message);

      setUsername('');
      setNombre('');
      setCorreoElectronico('');
      setPassword('');
      setConfirmarPassword('');
    } catch (err) {
      console.error('Error al registrar administrador:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('No se pudo registrar el administrador.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AuthLayout showHeader>
      <AuthCard errorMessage={error}>
        <form className="login-form" onSubmit={handleSubmit}>
          <TextField
            name="username"
            placeholder="Nombre de usuario"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={guardando}
          />

          <TextField
            name="nombre"
            placeholder="Nombre completo"
            autoComplete="name"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            disabled={guardando}
          />

          <TextField
            name="correoElectronico"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={correoElectronico}
            onChange={(event) =>
              setCorreoElectronico(event.target.value)
            }
            disabled={guardando}
          />

          <PasswordField
            name="password"
            placeholder="Contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={guardando}
          />

          <PasswordField
            name="confirmarPassword"
            placeholder="Confirmar contraseña"
            autoComplete="new-password"
            value={confirmarPassword}
            onChange={(event) =>
              setConfirmarPassword(event.target.value)
            }
            disabled={guardando}
          />

          {mensaje && (
            <div className="success-message">
              <p>{mensaje}</p>

              <Button
                type="button"
                variant="auth"
                onClick={onRegistered}
              >
                Iniciar sesión
              </Button>
            </div>
          )}

          {!mensaje && (
            <Button
              type="submit"
              variant="auth"
              disabled={guardando}
            >
              {guardando ? 'Registrando...' : 'Registrarse'}
            </Button>
          )}

          <Button
            type="button"
            variant="auth"
            onClick={onBack}
            disabled={guardando}
          >
            Volver
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
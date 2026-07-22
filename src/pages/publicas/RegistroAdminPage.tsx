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
  
  // Refactor error state to support per-field errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const validar = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio.';
      isValid = false;
    } else if (username.trim().length < 4) {
      newErrors.username = 'El nombre de usuario debe tener al menos 4 caracteres.';
      isValid = false;
    }

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre completo es obligatorio.';
      isValid = false;
    }

    if (!correoElectronico.trim()) {
      newErrors.correoElectronico = 'El correo electrónico es obligatorio.';
      isValid = false;
    } else if (!correoElectronico.includes('@')) {
      newErrors.correoElectronico = 'El correo electrónico no es válido.';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
      isValid = false;
    }

    if (password !== confirmarPassword) {
      newErrors.confirmarPassword = 'Las contraseñas no coinciden.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validar()) {
      setMensaje('');
      setGlobalError('');
      return;
    }

    try {
      setGuardando(true);
      setErrors({});
      setGlobalError('');
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
        setGlobalError(err.message);
      } else {
        setGlobalError('No se pudo registrar el administrador.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AuthLayout showHeader>
      <AuthCard 
        errorMessage={globalError}
        title="Registro de Administrador"
        description="Crea tu cuenta para configurar el sistema, gestionar los procesos electorales y crear las votaciones de forma segura."
      >
        <form className="login-form" onSubmit={handleSubmit}>
          <TextField
            name="username"
            label="Nombre de usuario"
            placeholder="Ej: admin_votos"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={guardando}
            error={errors.username}
          />

          <TextField
            name="nombre"
            label="Nombre completo"
            placeholder="Ej: Juan Pérez"
            autoComplete="name"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            disabled={guardando}
            error={errors.nombre}
          />

          <TextField
            name="correoElectronico"
            type="email"
            label="Correo electrónico"
            placeholder="Ej: juan.perez@votos.com"
            autoComplete="email"
            value={correoElectronico}
            onChange={(event) =>
              setCorreoElectronico(event.target.value)
            }
            disabled={guardando}
            error={errors.correoElectronico}
          />

          <PasswordField
            name="password"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={guardando}
            error={errors.password}
            showStrengthBar
          />

          <PasswordField
            name="confirmarPassword"
            label="Confirmar contraseña"
            placeholder="Repite la contraseña"
            autoComplete="new-password"
            value={confirmarPassword}
            onChange={(event) =>
              setConfirmarPassword(event.target.value)
            }
            disabled={guardando}
            error={errors.confirmarPassword}
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
            <>
              <Button
                type="submit"
                variant="auth"
                disabled={guardando}
              >
                {guardando ? 'Registrando...' : 'Registrarse'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <span style={{ fontFamily: 'var(--font-primary)', fontSize: '14px', color: '#4b5563' }}>
                  ¿Ya tienes una cuenta?{' '}
                </span>
                <button 
                  type="button" 
                  onClick={onBack}
                  className="register-link" 
                  style={{ background: 'none', border: 'none', padding: 0, display: 'inline', cursor: 'pointer', fontSize: '14px' }}
                  disabled={guardando}
                >
                  Inicia sesión
                </button>
              </div>
            </>
          )}
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
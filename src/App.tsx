import { useEffect, useState } from 'react';
import keycloak from './auth/keycloak';

import DashboardInicialPage from './pages/publicas/DashboardInicialPage';
import RegistroAdminPage from './pages/publicas/RegistroAdminPage';

import ListaVotacionesActivasPage from './pages/votante/ListaVotacionesActivasPage';
import VotoPage from './pages/votante/VotoPage';
import ConfirmacionVotoPage from './pages/votante/ConfirmacionVotoPage';

import ListaVotantesPage from './pages/administrador/ListaVotantesPage';
import CreacionVotantePage from './pages/administrador/CreacionVotantePage';
import ModificacionVotantePage from './pages/administrador/ModificacionVotantePage';

import ListaVotacionesPage from './pages/administrador/ListaVotacionesPage';
import CreacionVotacionPage from './pages/administrador/CreacionVotacionPage';
import ModificacionVotacionPage from './pages/administrador/ModificacionVotacionPage';
import AsignacionVotantesPage from './pages/administrador/AsignacionVotantesPage';
import VerResultadosPage from './pages/administrador/VerResultadosPage';

type PublicPage =
  | 'landing'
  | 'registro-admin';

type Page =
  | 'votaciones'
  | 'voto'
  | 'confirmacion'
  | 'admin-votantes'
  | 'admin-crear-votante'
  | 'admin-editar-votante'
  | 'admin-votaciones'
  | 'admin-crear-votacion'
  | 'admin-editar-votacion'
  | 'admin-asignacion'
  | 'admin-resultados'
  | 'historial';

function App() {
  const [keycloakReady, setKeycloakReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const [publicPage, setPublicPage] =
    useState<PublicPage>('landing');

  const [page, setPage] =
    useState<Page>('votaciones');

  const [selectedVotanteId, setSelectedVotanteId] =
    useState<number | null>(null);

  const [selectedReferendumId, setSelectedReferendumId] =
    useState<number | null>(null);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((auth) => {
        setAuthenticated(auth);

        if (auth) {
          const roles =
            keycloak.tokenParsed?.realm_access?.roles ?? [];

          console.log('Roles:', roles);
          console.log('Token:', keycloak.tokenParsed);

          if (roles.includes('ADMIN')) {
            setPage('admin-votantes');
          } else if (roles.includes('AUDITOR')) {
            setPage('admin-resultados');
          } else {
            setPage('votaciones');
          }
        }

        setKeycloakReady(true);
      })
      .catch((error) => {
        console.error(
          'Error inicializando Keycloak:',
          error
        );

        setKeycloakReady(true);
      });
  }, []);

  const iniciarSesion = () => {
    keycloak.login({
      redirectUri: window.location.origin,
    });
  };

  const finalizarSesion = () => {
    localStorage.removeItem(
      'idReferendumSeleccionado'
    );

    localStorage.removeItem(
      'respuestasVoto'
    );

    localStorage.removeItem(
      'votosRegistrados'
    );

    localStorage.removeItem(
      'ultimoVoto'
    );

    sessionStorage.clear();

    keycloak.clearToken();

    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  const goToAdminVotantes = () => {
    setSelectedVotanteId(null);
    setPage('admin-votantes');
  };

  const goToAdminVotaciones = () => {
    setSelectedReferendumId(null);
    setPage('admin-votaciones');
  };

  const goToAdminResultados = () => {
    setPage('admin-resultados');
  };

  const roles =
    keycloak.tokenParsed?.realm_access?.roles ?? [];

  const isAdmin =
    roles.includes('ADMIN');

  const isAuditor =
    roles.includes('AUDITOR');

  const isVotante =
    roles.includes('VOTANTE');

  if (!keycloakReady) {
    return (
      <p style={{ padding: '2rem' }}>
        Cargando autenticación...
      </p>
    );
  }

  if (!authenticated) {
    if (publicPage === 'registro-admin') {
      return (
        <RegistroAdminPage
          onBack={() =>
            setPublicPage('landing')
          }
          onRegistered={iniciarSesion}
        />
      );
    }

    return (
      <DashboardInicialPage
        onLogin={iniciarSesion}
        onRegister={() =>
          setPublicPage('registro-admin')
        }
      />
    );
  }

  if (isAdmin || isAuditor) {
    if (
      page === 'admin-votantes' &&
      isAdmin
    ) {
      return (
        <ListaVotantesPage
          onLogout={finalizarSesion}
          onGoToCreate={() =>
            setPage('admin-crear-votante')
          }
          onGoToEdit={(idVotante) => {
            setSelectedVotanteId(idVotante);
            setPage('admin-editar-votante');
          }}
          onGoToVotantes={goToAdminVotantes}
          onGoToVotaciones={goToAdminVotaciones}
          onGoToResultados={goToAdminResultados}
        />
      );
    }

    if (
      page === 'admin-crear-votante' &&
      isAdmin
    ) {
      return (
        <CreacionVotantePage
          onLogout={finalizarSesion}
          onBack={goToAdminVotantes}
          onCreated={goToAdminVotantes}
          onGoToVotantes={goToAdminVotantes}
          onGoToVotaciones={goToAdminVotaciones}
          onGoToResultados={goToAdminResultados}
        />
      );
    }

    if (
      page === 'admin-editar-votante' &&
      isAdmin &&
      selectedVotanteId
    ) {
      return (
        <ModificacionVotantePage
          idVotante={selectedVotanteId}
          onLogout={finalizarSesion}
          onBack={goToAdminVotantes}
          onUpdated={goToAdminVotantes}
          onGoToVotantes={goToAdminVotantes}
          onGoToVotaciones={goToAdminVotaciones}
          onGoToResultados={goToAdminResultados}
        />
      );
    }

    if (page === 'admin-votaciones') {
      return (
        <ListaVotacionesPage
          onLogout={finalizarSesion}
          onGoToCreate={() =>
            setPage('admin-crear-votacion')
          }
          onGoToEdit={(idReferendum) => {
            setSelectedReferendumId(idReferendum);
            setPage('admin-editar-votacion');
          }}
          onGoToAssign={(idReferendum) => {
            setSelectedReferendumId(idReferendum);
            setPage('admin-asignacion');
          }}
          onGoToResults={(idReferendum) => {
            setSelectedReferendumId(idReferendum);
            setPage('admin-resultados');
          }}
          onGoToVotantes={goToAdminVotantes}
          onGoToVotaciones={goToAdminVotaciones}
          onGoToResultados={goToAdminResultados}
        />
      );
    }

    if (
      page === 'admin-crear-votacion' &&
      isAdmin
    ) {
      return (
        <CreacionVotacionPage
          onLogout={finalizarSesion}
          onBack={goToAdminVotaciones}
          onCreated={goToAdminVotaciones}
          onGoToVotantes={goToAdminVotantes}
          onGoToVotaciones={goToAdminVotaciones}
          onGoToResultados={goToAdminResultados}
        />
      );
    }

    if (
      page === 'admin-editar-votacion' &&
      isAdmin &&
      selectedReferendumId
    ) {
      return (
        <ModificacionVotacionPage
          idReferendum={selectedReferendumId}
          onLogout={finalizarSesion}
          onBack={goToAdminVotaciones}
          onGoToVotantes={goToAdminVotantes}
          onGoToVotaciones={goToAdminVotaciones}
          onGoToResultados={goToAdminResultados}
        />
      );
    }

    if (
      page === 'admin-asignacion' &&
      isAdmin &&
      selectedReferendumId
    ) {
      return (
        <AsignacionVotantesPage
          idReferendum={selectedReferendumId}
          onLogout={finalizarSesion}
          onBack={goToAdminVotaciones}
          onGoToVotantes={goToAdminVotantes}
          onGoToVotaciones={goToAdminVotaciones}
          onGoToResultados={goToAdminResultados}
        />
      );
    }

    if (page === 'admin-resultados') {
      return (
        <VerResultadosPage
          idReferendumInicial={
            selectedReferendumId ?? undefined
          }
          onLogout={finalizarSesion}
          onBack={goToAdminVotaciones}
          onGoToVotantes={goToAdminVotantes}
          onGoToVotaciones={goToAdminVotaciones}
          onGoToResultados={goToAdminResultados}
        />
      );
    }

    return (
      <div style={{ padding: '2rem' }}>
        <h1>Página no disponible</h1>

        <button
          type="button"
          onClick={goToAdminVotantes}
        >
          Volver al panel
        </button>
      </div>
    );
  }

  if (isVotante) {
    if (page === 'voto') {
      return (
        <VotoPage
          onBack={() =>
            setPage('votaciones')
          }
          onVoteSuccess={() =>
            setPage('confirmacion')
          }
          onLogout={finalizarSesion}
        />
      );
    }

    if (page === 'confirmacion') {
      return (
        <ConfirmacionVotoPage
          onVolverAVotacion={() =>
            setPage('voto')
          }
          onVotacionCompletada={() => {
            setPage('votaciones');
          }}
          onLogout={finalizarSesion}
        />
      );
    }

    if (page === 'votaciones' || page === 'historial') {
      return (
        <ListaVotacionesActivasPage
          modo={page === 'historial' ? 'historial' : 'activas'}
          onGoToVote={() =>
            setPage('voto')
          }
          onLogout={finalizarSesion}
          onGoToVotaciones={() => setPage('votaciones')}
          onGoToHistorial={() => setPage('historial')}
        />
      );
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Acceso no autorizado</h1>

      <p>
        Tu usuario no tiene un rol válido
        para acceder al sistema.
      </p>

      <button
        type="button"
        onClick={finalizarSesion}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default App;
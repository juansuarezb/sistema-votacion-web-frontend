import { useEffect, useState } from 'react';
import keycloak from './auth/keycloak';

import DashboardInicialPage from './pages/publicas/DashboardInicialPage';
import ListaVotacionesActivasPage from './pages/votante/ListaVotacionesActivasPage';
import VotoPage from './pages/votante/VotoPage';
import ConfirmacionVotoPage from './pages/votante/ConfirmacionVotoPage';

type Page = 'votaciones' | 'voto' | 'confirmacion';

function App() {
  const [keycloakReady, setKeycloakReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState<Page>('votaciones');

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((auth) => {
        setAuthenticated(auth);
        setKeycloakReady(true);
      })
      .catch((error) => {
        console.error('Error inicializando Keycloak:', error);
        setKeycloakReady(true);
      });
  }, []);

  const iniciarSesion = () => {
    keycloak.login();
  };

  const finalizarSesion = () => {
    localStorage.removeItem('idReferendumSeleccionado');
    localStorage.removeItem('respuestasVoto');
    localStorage.removeItem('votosRegistrados');
    localStorage.removeItem('ultimoVoto');

    sessionStorage.clear();

    keycloak.clearToken();

    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  if (!keycloakReady) {
    return <p style={{ padding: '2rem' }}>Cargando autenticación...</p>;
  }

  if (!authenticated) {
    return (
      <>
        <DashboardInicialPage />

        <button
          type="button"
          onClick={iniciarSesion}
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            backgroundColor: '#0d47a1',
            color: 'white',
          }}
        >
          Iniciar sesión
        </button>
      </>
    );
  }

  if (page === 'voto') {
    return (
      <VotoPage
        onBack={() => setPage('votaciones')}
        onVoteSuccess={() => setPage('confirmacion')}
        onLogout={finalizarSesion}
      />
    );
  }

  if (page === 'confirmacion') {
    return (
      <ConfirmacionVotoPage
        onVolverAVotacion={() => setPage('voto')}
        onFinalizarSesion={finalizarSesion}
        onLogout={finalizarSesion}
      />
    );
  }

  return (
    <ListaVotacionesActivasPage
      onGoToVote={() => setPage('voto')}
      onLogout={finalizarSesion}
    />
  );
}

export default App;
import Keycloak from 'keycloak-js';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'votoseguro';
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'votoseguro-frontend-client';

if (!KEYCLOAK_URL) {
  throw new Error('No se encontró la variable de entorno VITE_KEYCLOAK_URL.');
}

const keycloak = new Keycloak({
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM, // <-- Cambiado a minúsculas / variable de entorno
  clientId: KEYCLOAK_CLIENT_ID,
});

export default keycloak;
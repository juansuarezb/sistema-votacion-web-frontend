import keycloak from '../auth/keycloak';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = keycloak.token;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;

    try {
      const errorBody = await response.json();
      errorMessage =
        errorBody.error ||
        errorBody.mensaje ||
        errorBody.message ||
        errorMessage;
    } catch {
      // Si el error no trae JSON, dejamos el mensaje HTTP.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
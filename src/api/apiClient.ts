import keycloak from "../auth/keycloak";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "No se encontró la variable de entorno VITE_API_URL."
  );
}

export interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Actualiza el token si está próximo a expirar.
 */
async function getAccessToken(): Promise<string | undefined> {
  if (!keycloak.authenticated) {
    return undefined;
  }

  try {
    await keycloak.updateToken(30);
    return keycloak.token;
  } catch (error) {
    console.error("No se pudo actualizar el token:", error);

    keycloak.logout({
      redirectUri: window.location.origin,
    });

    throw new Error(
      "La sesión expiró. Debes iniciar sesión nuevamente."
    );
  }
}

/**
 * Construye los headers comunes para todas las peticiones.
 */
async function buildHeaders(
  options: ApiRequestOptions
): Promise<Headers> {
  const headers = new Headers(options.headers);

  const hasBody =
    options.body !== undefined &&
    options.body !== null;

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (
    hasBody &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  /*
   * Evita la página de advertencia del plan gratuito de ngrok.
   * Solo se agrega cuando la API realmente usa un dominio ngrok.
   */
  if (API_URL.includes("ngrok-free")) {
    headers.set(
      "ngrok-skip-browser-warning",
      "true"
    );
  }

  const requireAuth = options.requireAuth ?? true;

  if (requireAuth) {
    const token = await getAccessToken();

    if (!token) {
      throw new Error(
        "No existe una sesión autenticada."
      );
    }

    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return headers;
}

/**
 * Cliente HTTP centralizado para consumir el API Gateway.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url = `${API_URL.replace(/\/$/, "")}${normalizedPath}`;

  const headers = await buildHeaders(options);

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error(
      `Error de red al llamar ${url}:`,
      error
    );

    throw new Error(
      "No se pudo conectar con el servidor."
    );
  }

  if (response.status === 401) {
    throw new Error(
      "La sesión no es válida o ha expirado."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "No tienes permisos para realizar esta acción."
    );
  }

  if (!response.ok) {
    const contentType =
      response.headers.get("content-type");

    let errorMessage =
      `Error ${response.status}: ${response.statusText}`;

    try {
      if (
        contentType?.includes("application/json")
      ) {
        const errorBody = await response.json();

        errorMessage =
          errorBody.message ??
          errorBody.title ??
          errorBody.detail ??
          JSON.stringify(errorBody);
      } else {
        const errorText = await response.text();

        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch {
      // Se conserva el mensaje HTTP original.
    }

    throw new Error(errorMessage);
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type");

  if (
    contentType?.includes("application/json")
  ) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
}
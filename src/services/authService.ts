import { apiRequest } from "../api/apiClient";

export interface RegisterAdminRequest {
  username: string;
  nombre: string;
  correoElectronico: string;
  password: string;
}

export interface RegisterAdminResponse {
  message: string;
  keycloakId: string;
}

export function registerAdmin(
  request: RegisterAdminRequest
): Promise<RegisterAdminResponse> {
  return apiRequest<RegisterAdminResponse>(
    "/api/auth/register-admin",
    {
      method: "POST",
      body: JSON.stringify(request),

      /*
       * Este endpoint es público porque el administrador
       * todavía no tiene una sesión iniciada.
       */
      requireAuth: false,
    }
  );
}
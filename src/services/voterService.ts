import { apiRequest } from "../api/apiClient";

export interface Votante {
  idVotante: number;
  keycloakId: string;
  nombre: string;
  cedula: string;
  correoElectronico: string;
  fechaRegistro: string;
}

export interface CreateVotanteRequest {
  keycloakId: string;
  nombre: string;
  cedula: string;
  correoElectronico: string;
}

export interface RegisterVotanteRequest {
  username: string;
  nombre: string;
  cedula: string;
  correoElectronico: string;
  password: string;
}

export interface RegisterVotanteResponse {
  message: string;
  keycloakId: string;
  voterProfile: Votante;
}

export interface UpdateVotanteRequest {
  keycloakId: string;
  nombre: string;
  cedula: string;
  correoElectronico: string;
}

export function getVotantes(): Promise<Votante[]> {
  return apiRequest<Votante[]>(
    "/api/votantes"
  );
}

export function getVotanteById(
  id: number
): Promise<Votante> {
  return apiRequest<Votante>(
    `/api/votantes/${id}`
  );
}

/**
 * Crea solamente el perfil dentro de VoterService.
 */
export function createVotante(
  data: CreateVotanteRequest
): Promise<Votante> {
  return apiRequest<Votante>(
    "/api/votantes",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

/**
 * Crea el usuario en Keycloak, asigna el rol VOTANTE
 * y crea el perfil en VoterService.
 */
export function registerVotante(
  data: RegisterVotanteRequest
): Promise<RegisterVotanteResponse> {
  return apiRequest<RegisterVotanteResponse>(
    "/api/auth/register-voter",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateVotante(
  id: number,
  data: UpdateVotanteRequest
): Promise<void> {
  return apiRequest<void>(
    `/api/votantes/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

/**
 * Elimina la identidad de Keycloak
 * y el perfil almacenado en VoterService.
 */
export function deleteVotante(
  id: number
): Promise<void> {
  return apiRequest<void>(
    `/api/auth/voters/${id}`,
    {
      method: "DELETE",
    }
  );
}

export function getVotanteByKeycloakId(
  keycloakId: string
): Promise<Votante> {
  return apiRequest<Votante>(
    `/api/votantes/by-keycloak/${encodeURIComponent(
      keycloakId
    )}`
  );
}
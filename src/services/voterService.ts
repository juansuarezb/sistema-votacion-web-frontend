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

export function getVotantes() {
  return apiRequest<Votante[]>("/api/votantes");
}

export function getVotanteById(id: number) {
  return apiRequest<Votante>(`/api/votantes/${id}`);
}

/**
 * Endpoint antiguo:
 * crea únicamente el perfil en VoterService.
 */
export function createVotante(data: CreateVotanteRequest) {
  return apiRequest<Votante>("/api/votantes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Endpoint nuevo:
 * crea el usuario en Keycloak, asigna VOTANTE
 * y crea el perfil en VoterService.
 */
export function registerVotante(data: RegisterVotanteRequest) {
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
) {
  return apiRequest<void>(`/api/votantes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Elimina tanto la identidad de Keycloak
 * como el perfil almacenado en VoterService.
 */
export function deleteVotante(id: number) {
  return apiRequest<void>(`/api/auth/voters/${id}`, {
    method: "DELETE",
  });
}

export function getVotanteByKeycloakId(
  keycloakId: string
) {
  return apiRequest<Votante>(
    `/api/votantes/by-keycloak/${keycloakId}`
  );
}
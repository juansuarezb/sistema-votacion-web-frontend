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

export function createVotante(data: CreateVotanteRequest) {
  return apiRequest<Votante>("/api/votantes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateVotante(id: number, data: UpdateVotanteRequest) {
  return apiRequest<void>(`/api/votantes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteVotante(id: number) {
  return apiRequest<void>(`/api/votantes/${id}`, {
    method: "DELETE",
  });
}

export function getVotanteByKeycloakId(keycloakId: string) {
  return apiRequest<Votante>(`/api/votantes/by-keycloak/${keycloakId}`);
}
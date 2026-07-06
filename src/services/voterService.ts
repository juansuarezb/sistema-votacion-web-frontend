import { apiRequest } from "../api/apiClient";

export interface Votante {
  idVotante: number;
  keycloakId: string;
  nombre: string;
  cedula: string;
  correoElectronico: string;
  fechaRegistro: string;
}

export function getVotantes() {
  return apiRequest<Votante[]>("/api/votantes");
}
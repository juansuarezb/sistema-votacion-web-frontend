import { apiRequest } from "../api/apiClient";

export interface Referendum {
  idReferendum: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: string;
  fechaCreacion: string;
}

export interface AssignedReferendum {
  idReferendum: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: string;
  totalPreguntas: number;
  preguntasPendientes: number;
}

export interface ReferendumQuestion {
  idQuestion: number;
  idReferendum: number;
  texto: string;
}

export interface CreateReferendumRequest {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: string;
}

export interface UpdateReferendumRequest {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: string;
}

export interface CreateQuestionRequest {
  texto: string;
}

export interface EligibilityResponse {
  idReferendum?: number;
  idQuestion?: number;
  idVotante?: number;
  asignado?: boolean;
  haVotado?: boolean;
  puedeVotar?: boolean;
  mensaje?: string;
}

export function getReferendums() {
  return apiRequest<Referendum[]>("/api/referendums");
}

export function getReferendumById(id: number) {
  return apiRequest<Referendum>(`/api/referendums/${id}`);
}

export function createReferendum(data: CreateReferendumRequest) {
  return apiRequest<Referendum>("/api/referendums", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateReferendum(
  id: number,
  data: UpdateReferendumRequest
) {
  return apiRequest<void>(`/api/referendums/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteReferendum(id: number) {
  return apiRequest<void>(`/api/referendums/${id}`, {
    method: "DELETE",
  });
}

export function getReferendumQuestions(idReferendum: number) {
  return apiRequest<ReferendumQuestion[]>(
    `/api/referendums/${idReferendum}/questions`
  );
}

export function createReferendumQuestion(
  idReferendum: number,
  data: CreateQuestionRequest
) {
  return apiRequest<ReferendumQuestion>(
    `/api/referendums/${idReferendum}/questions`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function assignVoterToReferendum(
  idReferendum: number,
  idVotante: number
) {
  return apiRequest<void>(
    `/api/referendums/${idReferendum}/voters`,
    {
      method: "POST",
      body: JSON.stringify({ idVotante }),
    }
  );
}

export function getAssignedReferendumsByVoter(
  idVotante: number
) {
  return apiRequest<AssignedReferendum[]>(
    `/api/referendums/voters/${idVotante}/assigned`
  );
}

export function getQuestionEligibility(
  idReferendum: number,
  idQuestion: number,
  idVotante: number
) {
  return apiRequest<EligibilityResponse>(
    `/api/referendums/${idReferendum}/questions/${idQuestion}/voters/${idVotante}/eligibility`
  );
}
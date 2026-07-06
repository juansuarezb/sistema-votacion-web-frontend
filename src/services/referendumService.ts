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

export interface ReferendumQuestion {
  idQuestion: number;
  idReferendum: number;
  texto: string;
}

export interface EligibilityResponse {
  eligible?: boolean;
  isEligible?: boolean;
  puedeVotar?: boolean;
  haVotado?: boolean;
  message?: string;
}

export function getReferendums() {
  return apiRequest<Referendum[]>("/api/referendums");
}

export function getReferendumQuestions(idReferendum: number) {
  return apiRequest<ReferendumQuestion[]>(
    `/api/referendums/${idReferendum}/questions`
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
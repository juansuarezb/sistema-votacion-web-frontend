import { apiRequest } from "../api/apiClient";

export interface Referendum {
  idReferendum: number;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: string;
  fechaCreacion: string;
}

export interface AssignedReferendum {
  idReferendum: number;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: string;
  totalPreguntas: number;
  preguntasPendientes: number;
}

export interface Candidate {
  idCandidate: number;
  idQuestion: number;
  nombre: string;
  imagenUrl?: string;
}

export interface ReferendumQuestion {
  idQuestion: number;
  idReferendum: number;
  texto: string;
  candidatos?: Candidate[];
}

export interface CreateReferendumRequest {
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: string;
}

export interface UpdateReferendumRequest {
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: string;
}

export interface CreateQuestionRequest {
  texto: string;
}

export interface UpdateQuestionRequest {
  texto: string;
}

export interface CreateCandidateRequest {
  nombre: string;
  imagenUrl?: string;
}

export interface EligibilityResponse {
  idReferendum: number;
  idQuestion: number;
  idVotante: number;
  asignado: boolean;
  haVotado: boolean;
  puedeVotar: boolean;
  mensaje: string;
}

export interface VoterAssignmentStatus {
  idVotante: number;
  asignado: boolean;
  haCompletado: boolean;
  totalPreguntas: number;
  preguntasRespondidas: number;
  preguntasPendientes: number;
  estado: 'ASIGNADO' | 'COMPLETADO';
}

export function getReferendums(): Promise<
  Referendum[]
> {
  return apiRequest<Referendum[]>(
    "/api/referendums"
  );
}

export function getReferendumById(
  id: number
): Promise<Referendum> {
  return apiRequest<Referendum>(
    `/api/referendums/${id}`
  );
}

export function createReferendum(
  data: CreateReferendumRequest
): Promise<Referendum> {
  return apiRequest<Referendum>(
    "/api/referendums",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateReferendum(
  id: number,
  data: UpdateReferendumRequest
): Promise<void> {
  return apiRequest<void>(
    `/api/referendums/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deleteReferendum(
  id: number
): Promise<void> {
  return apiRequest<void>(
    `/api/referendums/${id}`,
    {
      method: "DELETE",
    }
  );
}

export function getReferendumQuestions(
  idReferendum: number
): Promise<ReferendumQuestion[]> {
  return apiRequest<ReferendumQuestion[]>(
    `/api/referendums/${idReferendum}/questions`
  );
}

export function createReferendumQuestion(
  idReferendum: number,
  data: CreateQuestionRequest
): Promise<ReferendumQuestion> {
  return apiRequest<ReferendumQuestion>(
    `/api/referendums/${idReferendum}/questions`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateReferendumQuestion(
  idReferendum: number,
  idQuestion: number,
  data: UpdateQuestionRequest
): Promise<void> {
  return apiRequest<void>(
    `/api/referendums/${idReferendum}/questions/${idQuestion}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deleteReferendumQuestion(
  idReferendum: number,
  idQuestion: number
): Promise<void> {
  return apiRequest<void>(
    `/api/referendums/${idReferendum}/questions/${idQuestion}`,
    {
      method: "DELETE",
    }
  );
}

export function createReferendumCandidate(
  idReferendum: number,
  idQuestion: number,
  data: CreateCandidateRequest
): Promise<Candidate> {
  return apiRequest<Candidate>(
    `/api/referendums/${idReferendum}/questions/${idQuestion}/candidates`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateReferendumCandidate(
  idReferendum: number,
  idQuestion: number,
  idCandidate: number,
  data: CreateCandidateRequest
): Promise<void> {
  return apiRequest<void>(
    `/api/referendums/${idReferendum}/questions/${idQuestion}/candidates/${idCandidate}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deleteReferendumCandidate(
  idReferendum: number,
  idQuestion: number,
  idCandidate: number
): Promise<void> {
  return apiRequest<void>(
    `/api/referendums/${idReferendum}/questions/${idQuestion}/candidates/${idCandidate}`,
    {
      method: "DELETE",
    }
  );
}

export function assignVoterToReferendum(
  idReferendum: number,
  idVotante: number
): Promise<void> {
  return apiRequest<void>(
    `/api/referendums/${idReferendum}/voters`,
    {
      method: "POST",
      body: JSON.stringify({
        idVotante,
      }),
    }
  );
}

export function getAssignedReferendumsByVoter(
  idVotante: number
): Promise<AssignedReferendum[]> {
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

export function getVoterAssignmentStatuses(
  idReferendum: number
): Promise<VoterAssignmentStatus[]> {
  return apiRequest<VoterAssignmentStatus[]>(
    `/api/referendums/${idReferendum}/voters/status`
  );
}
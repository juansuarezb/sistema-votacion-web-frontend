import { apiRequest } from '../api/apiClient';

export interface QuestionResult {
  idQuestion: number;
  si: number;
  no: number;
  blanco: number;
  nulo: number;
  total: number;
  porcentajeSi: number;
  porcentajeNo: number;
  porcentajeBlanco: number;
  porcentajeNulo: number;
}

export interface ResultResponse {
  idReferendum: number;
  totalVotes: number;
  questions: QuestionResult[];
}

export function getResultsByReferendum(
  idReferendum: number
): Promise<ResultResponse> {
  return apiRequest<ResultResponse>(
    `/api/results/referendums/${idReferendum}`
  );
}
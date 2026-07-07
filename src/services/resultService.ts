import { apiRequest } from "../api/apiClient";

export interface ResultResponse {
  idReferendum: number;
  totalSi: number;
  totalNo: number;
  totalBlanco: number;
  totalNulo: number;
  totalVotos: number;
}

export function getResultsByReferendum(idReferendum: number) {
  return apiRequest<ResultResponse>(`/api/results/referendums/${idReferendum}`);
}
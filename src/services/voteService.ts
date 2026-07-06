import { apiRequest } from "../api/apiClient";

export type TipoVoto = "SI" | "NO" | "BLANCO" | "NULO";

export interface CreateVoteRequest {
  idReferendum: number;
  idQuestion: number;
  idVotante: number;
  tipoVoto: TipoVoto;
}

export interface VoteResponse {
  idVote: number;
  idReferendum: number;
  idQuestion: number;
  tipoVoto: TipoVoto;
  fecha: string;
}

export function createVote(data: CreateVoteRequest) {
  return apiRequest<VoteResponse>("/api/votes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
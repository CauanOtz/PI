import { http } from "../lib/http";

export interface Aula {
  id: number;
  titulo: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM ou HH:MM:SS
  descricao: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AulaPayload {
  titulo: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM ou HH:MM:SS
  descricao?: string;
}

export async function listAulas() {
  const res = await http.get<{ sucesso: boolean; dados: { aulas: any[] } }>('/aulas');
  return res.data.dados.aulas;
}

export async function createAula(payload: AulaPayload) {
  const res = await http.post<{ sucesso: boolean; dados: any }>('/aulas', payload);
  return res.data.dados;
}

export async function updateAula(id: number, payload: Partial<AulaPayload>) {
  const res = await http.put<{ sucesso: boolean; dados: any }>(`/aulas/${id}`, payload);
  return res.data.dados;
}

export async function deleteAula(id: number) {
  const res = await http.delete(`/aulas/${id}`);
  return res;
}

export default { listAulas, createAula, updateAula, deleteAula };

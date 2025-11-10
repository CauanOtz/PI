import { http } from "../lib/http";

// Interfaces para Atividades
export interface Atividade {
  id: number;
  titulo: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM ou HH:MM:SS
  descricao: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AtividadePayload {
  titulo: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM ou HH:MM:SS
  descricao?: string;
}

// Funções para Atividades
export async function listAtividades() {
  const res = await http.get<{ sucesso: boolean; dados: { atividades: any[] } }>('/atividades');
  return res.data.dados.atividades;
}

export async function createAtividade(payload: AtividadePayload) {
  const res = await http.post<{ sucesso: boolean; dados: any }>('/atividades', payload);
  return res.data.dados;
}

export async function updateAtividade(id: number, payload: Partial<AtividadePayload>) {
  const res = await http.put<{ sucesso: boolean; dados: any }>(`/atividades/${id}`, payload);
  return res.data.dados;
}

export async function deleteAtividade(id: number) {
  const res = await http.delete(`/atividades/${id}`);
  return res;
}

// Manter compatibilidade com nomes antigos (deprecated)
/** @deprecated Use listAtividades() */
export const listAulas = listAtividades;
/** @deprecated Use createAtividade() */
export const createAula = createAtividade;
/** @deprecated Use updateAtividade() */
export const updateAula = updateAtividade;
/** @deprecated Use deleteAtividade() */
export const deleteAula = deleteAtividade;
/** @deprecated Use Atividade */
export type Aula = Atividade;
/** @deprecated Use AtividadePayload */
export type AulaPayload = AtividadePayload;

export default { 
  listAtividades, 
  createAtividade, 
  updateAtividade, 
  deleteAtividade,
  // Deprecated
  listAulas,
  createAula,
  updateAula,
  deleteAula
};

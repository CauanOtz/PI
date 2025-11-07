import { http } from "../lib/http";

// DEPRECATED: Este arquivo está sendo substituído por atividade.ts
// Mantido apenas para compatibilidade retroativa

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

/** @deprecated Use listAtividades from atividade.ts */
export async function listAulas() {
  // Tenta buscar de /atividades primeiro, depois /aulas para compatibilidade
  try {
    const res = await http.get<{ sucesso: boolean; dados: { atividades: any[] } }>('/atividades');
    return res.data.dados.atividades;
  } catch {
    const res = await http.get<{ sucesso: boolean; dados: { aulas: any[] } }>('/aulas');
    return res.data.dados.aulas;
  }
}

/** @deprecated Use createAtividade from atividade.ts */
export async function createAula(payload: AulaPayload) {
  try {
    const res = await http.post<{ sucesso: boolean; dados: any }>('/atividades', payload);
    return res.data.dados;
  } catch {
    const res = await http.post<{ sucesso: boolean; dados: any }>('/aulas', payload);
    return res.data.dados;
  }
}

/** @deprecated Use updateAtividade from atividade.ts */
export async function updateAula(id: number, payload: Partial<AulaPayload>) {
  try {
    const res = await http.put<{ sucesso: boolean; dados: any }>(`/atividades/${id}`, payload);
    return res.data.dados;
  } catch {
    const res = await http.put<{ sucesso: boolean; dados: any }>(`/aulas/${id}`, payload);
    return res.data.dados;
  }
}

/** @deprecated Use deleteAtividade from atividade.ts */
export async function deleteAula(id: number) {
  try {
    const res = await http.delete(`/atividades/${id}`);
    return res;
  } catch {
    const res = await http.delete(`/aulas/${id}`);
    return res;
  }
}

export default { listAulas, createAula, updateAula, deleteAula };


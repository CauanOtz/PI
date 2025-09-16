import { http } from "../lib/http";

export interface AulaPayload {
  titulo: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM ou HH:MM:SS
  descricao?: string;
}

export async function listAulas() {
  const res = await http.get('/aulas');
  return res.data;
}

export async function createAula(payload: AulaPayload) {
  const res = await http.post('/aulas', payload);
  return res.data;
}

export async function updateAula(id: number, payload: Partial<AulaPayload>) {
  const res = await http.put(`/aulas/${id}`, payload);
  return res.data;
}

export async function deleteAula(id: number) {
  const res = await http.delete(`/aulas/${id}`);
  return res;
}

export default { listAulas, createAula, updateAula, deleteAula };

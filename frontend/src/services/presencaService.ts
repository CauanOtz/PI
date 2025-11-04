import { http } from "../lib/http";
import { ResponseSuccess, Paginacao } from "./users";

export interface Presenca {
  id: number;
  idAluno: number;
  idAula: number;
  status: "presente" | "falta" | "atraso" | "falta_justificada";
  data_registro: string;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
}

export const presencaService = {
  async list(params?: { page?: number; limit?: number }) {
    const res = await http.get<ResponseSuccess<{
      presencas: Presenca[];
      paginacao: Paginacao;
    }>>("/presencas", { params });
    return res.data.dados;
  },

  async create(payload: {
    idAluno: number | string;
    idAula: number | string;
    status: "presente" | "falta" | "atraso" | "falta_justificada";
    data_registro?: string;
    observacao?: string;
  }) {
    const res = await http.post<ResponseSuccess<Presenca>>("/presencas", payload);
    return res.data.dados;
  },

  async update(id: number | string, data: Partial<Presenca>) {
    const res = await http.put<ResponseSuccess<Presenca>>(`/presencas/${id}`, data);
    return res.data.dados;
  },

  async delete(id: number | string) {
    const res = await http.delete<ResponseSuccess<void>>(`/presencas/${id}`);
    return res.data.sucesso;
  },

  async listByAula(idAula: number | string, params?: any) {
    const res = await http.get<ResponseSuccess<{
      presencas: Presenca[];
      aula: {
        id: number;
        titulo: string;
        data: string;
        horario: string;
      };
    }>>(`/presencas/aulas/${idAula}`, { params });
    return res.data.dados;
  },

  async listByAluno(idAluno: number | string, params?: any) {
    const res = await http.get<ResponseSuccess<{
      presencas: Presenca[];
      aluno: {
        id: number;
        nome: string;
      };
    }>>(`/presencas/alunos/${idAluno}`, { params });
    return res.data.dados;
  },

  async bulkCreate(items: Array<{
    idAluno: number | string;
    idAula: number | string;
    status: "presente" | "falta" | "atraso" | "falta_justificada";
    data_registro?: string;
    observacao?: string;
  }>) {
    const res = await http.post<ResponseSuccess<Presenca[]>>("/presencas/bulk", items);
    return res.data.dados;
  },
};
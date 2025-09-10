import { http } from "../lib/http";

export interface BackendResponsavel {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
}

export interface BackendAluno {
  id: number;
  nome: string;
  idade?: number;
  endereco?: string | null;
  contato?: string | null;
  created_at?: string;
  updated_at?: string;
  responsaveis?: BackendResponsavel[];
}

export interface StudentsListResult {
  alunos: BackendAluno[];
  paginacao: {
    total: number;
    paginaAtual: number;
    totalPaginas: number;
    itensPorPagina: number;
    temProximaPagina: boolean;
    temPaginaAnterior: boolean;
  };
}

export const studentsService = {
  list(params?: { page?: number; limit?: number; search?: string }) {
    return http
      .get<{ sucesso: boolean; dados: StudentsListResult }>("/alunos", { params })
      .then((r) => r.data.dados);
  },

  get(id: number) {
    return http
      .get<{ sucesso: boolean; dados: BackendAluno }>(`/alunos/${id}`)
      .then((r) => r.data.dados);
  },

  create(payload: Partial<BackendAluno>) {
    // envia dados conforme backend espera (nome, idade, endereco, contato, ...)
    return http
      .post<{ sucesso: boolean; dados: BackendAluno }>("/alunos", payload)
      .then((r) => r.data.dados);
  },

  update(id: number, payload: Partial<BackendAluno>) {
    return http
      .put<{ sucesso: boolean; dados: BackendAluno }>(`/alunos/${id}`, payload)
      .then((r) => r.data.dados);
  },

  remove(id: number) {
    return http.delete<{ sucesso: boolean }>(`/alunos/${id}`).then((r) => r.data);
  },
};
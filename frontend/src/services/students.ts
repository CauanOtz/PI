import { http } from "../lib/http";

export interface BackendResponsavel {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
}

export interface BackendAssistido {
  id: number;
  nome: string;
  dataNascimento: string;
  sexo: 'Feminino' | 'Masculino';
  cartaoSus?: string | null;
  rg?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  contato?: string | null;
  contatoEmergencia?: string | null;
  problemasSaude?: string | null;
  medicamentosAlergias?: string | null;
  observacoes?: string | null;
  pai?: string | null;
  mae?: string | null;
  created_at?: string;
  updated_at?: string;
  responsaveis?: BackendResponsavel[];
  responsaveisIds?: number[];
}

export interface StudentsListResult {
  assistidos: BackendAssistido[];
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
      .get<{ sucesso: boolean; dados: StudentsListResult }>("/assistidos", { params })
      .then((r) => r.data.dados);
  },

  get(id: number) {
    return http
      .get<{ sucesso: boolean; dados: BackendAssistido }>(`/assistidos/${id}`)
      .then((r) => r.data.dados);
  },

  create(payload: Partial<BackendAssistido>) {
    // envia dados conforme backend espera (nome, idade, endereco, contato, ...)
    return http
      .post<{ sucesso: boolean; dados: BackendAssistido }>("/assistidos", payload)
      .then((r) => r.data.dados);
  },

  update(id: number, payload: Partial<BackendAssistido>) {
    return http
      .put<{ sucesso: boolean; dados: BackendAssistido }>(`/assistidos/${id}`, payload)
      .then((r) => r.data.dados);
  },

  remove(id: number) {
    return http.delete<{ sucesso: boolean }>(`/assistidos/${id}`).then((r) => r.data);
  },
};
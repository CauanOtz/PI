import { http } from "../lib/http";

// Normalized backend structure (3NF)
export interface BackendEndereco {
  cep: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface BackendContato {
  telefone: string;
  nomeContato?: string;
  parentesco?: string;
  observacao?: string;
  ordemPrioridade?: number;
}

export interface BackendFiliacao {
  mae?: string;
  pai?: string;
}

export interface BackendAssistido {
  id: number;
  nome: string;
  dataNascimento: string;
  sexo: 'Feminino' | 'Masculino';
  cartaoSus?: string | null;
  rg?: string | null;
  endereco?: BackendEndereco | null;
  numero?: string | null;
  complemento?: string | null;
  contatos: BackendContato[];
  filiacao?: BackendFiliacao | null;
  problemasSaude?: string | null;
  created_at?: string;
  updated_at?: string;
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
    console.log('🔵 [students.service] create chamado');
    console.log('🔵 [students.service] Payload:', JSON.stringify(payload, null, 2));
    // envia dados conforme backend espera (nome, idade, endereco, contato, ...)
    return http
      .post<{ sucesso: boolean; dados: BackendAssistido }>("/assistidos", payload)
      .then((r) => {
        console.log('🟢 [students.service] Resposta do backend:', r.data);
        return r.data.dados;
      })
      .catch((err) => {
        console.error('🔴 [students.service] Erro na requisição:', err);
        throw err;
      });
  },

  update(id: number, payload: Partial<BackendAssistido>) {
    console.log('🔵 [students.service] update chamado para ID:', id);
    console.log('🔵 [students.service] Payload:', JSON.stringify(payload, null, 2));
    return http
      .put<{ sucesso: boolean; dados: BackendAssistido }>(`/assistidos/${id}`, payload)
      .then((r) => {
        console.log('🟢 [students.service] Resposta do UPDATE:', r.data);
        return r.data.dados;
      })
      .catch((err) => {
        console.error('🔴 [students.service] Erro no UPDATE:', err);
        throw err;
      });
  },

  remove(id: number) {
    return http.delete<{ sucesso: boolean }>(`/assistidos/${id}`).then((r) => r.data);
  },
};
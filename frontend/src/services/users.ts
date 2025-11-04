import { http } from "../lib/http";

export interface Paginacao {
  total: number;
  paginaAtual: number;
  totalPaginas: number;
  itensPorPagina: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

export interface BackendUsuario {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  role?: string;
  cpf?: string; 
  createdAt?: string;
  updatedAt?: string;
}

export interface ResponseSuccess<T> {
  sucesso: true;
  dados: T;
}

export interface CreateUserPayload {
  nome: string;
  email?: string;
  telefone?: string;
  cpf: string;
  senha: string;
  role?: "admin" | "responsavel";
}

export interface EditUserPayload {
  nome: string;
  email?: string;
  telefone?: string;
  cpf: string;
  role?: "admin" | "responsavel";
}

// GET /usuarios
// POST /usuarios/registrar
// PUT /usuarios/:cpf
// DELETE /usuarios/:cpf
export const usuariosService = {
  async list(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    const res = await http.get<ResponseSuccess<{
      usuarios: BackendUsuario[];
      paginacao: Paginacao;
    }>>("/usuarios", { params });
    return res.data.dados;
  },

  async getByCPF(cpf: string) {
    const res = await http.get<ResponseSuccess<BackendUsuario>>(`/usuarios/${encodeURIComponent(cpf)}`);
    return res.data.dados;
  },

  async create(payload: { nome: string; email?: string; telefone?: string; cpf: string; senha: string; role?: string }) {
    const res = await http.post<ResponseSuccess<BackendUsuario>>("/usuarios/registrar", payload);
    return res.data.dados;
  },

  async updateByCPF(cpf: string, payload: Partial<BackendUsuario & { role?: string }>) {
    const res = await http.put<ResponseSuccess<BackendUsuario>>(`/usuarios/${encodeURIComponent(cpf)}`, payload);
    return res.data.dados;
  },

  async removeByCPF(cpf: string) {
    const res = await http.delete<ResponseSuccess<{ mensagem: string }>>(`/usuarios/${encodeURIComponent(cpf)}`);
    return res.data.dados;
  }
};
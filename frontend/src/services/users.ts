import { http } from "../lib/http";

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
  list(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    return http
      .get<{ usuarios?: BackendUsuario[]; total?: number; page?: number; totalPages?: number }>("/usuarios", { params })
      .then(r => r.data);
  },

  getByCPF(cpf: string) {
    return http.get<{ usuario?: BackendUsuario }>(`/usuarios/${encodeURIComponent(cpf)}`).then(r => r.data);
  },

  create(payload: { nome: string; email?: string; telefone?: string; cpf: string; senha: string; role?: string }) {
    return http.post("/usuarios/registrar", payload).then(r => r.data);
  },

  updateByCPF(cpf: string, payload: Partial<BackendUsuario & { role?: string }>) {
    return http.put(`/usuarios/${encodeURIComponent(cpf)}`, payload).then(r => r.data);
  },

  removeByCPF(cpf: string) {
    return http.delete(`/usuarios/${encodeURIComponent(cpf)}`).then(r => r.data);
  }
};
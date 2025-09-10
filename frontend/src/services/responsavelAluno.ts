import { http } from "../lib/http";

export const responsavelAlunoService = {
  // body: { idUsuario: number, idAluno: number }
  vincular(payload: { idUsuario: number; idAluno: number }) {
    return http.post("/responsaveis-alunos", payload).then(r => r.data);
  },

  // DELETE /usuario/:idUsuario/aluno/:idAluno
  desvincular(idUsuario: number, idAluno: number) {
    return http.delete(`/responsaveis-alunos/usuario/${encodeURIComponent(String(idUsuario))}/aluno/${encodeURIComponent(String(idAluno))}`).then(r => r.data);
  },

  // GET /responsaveis/:responsavelId/alunos
  // Retorna o body inteiro (paginado) para que o caller extraia `alunos` / `rows` / `items` ou array simples
  listByResponsavel(responsavelId: number, params?: { page?: number; limit?: number }) {
    return http.get(`/responsaveis/${encodeURIComponent(String(responsavelId))}/alunos`, { params }).then(r => r.data);
  }
};
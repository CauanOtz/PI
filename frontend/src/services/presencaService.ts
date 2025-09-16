import { http } from "../lib/http"; // ajuste se seu http helper estiver em outro caminho

export const presencaService = {
  async list(params?: any) {
    // GET /presencas?...
    const res = await http.get("/presencas", { params });
    return res.data;
  },

  async create(payload: {
    idAluno: number | string;
    idAula: number | string;
    status: "presente" | "falta" | "atraso" | "falta_justificada";
    data_registro?: string;
    observacao?: string;
  }) {
    const res = await http.post("/presencas", payload);
    return res.data;
  },

  async update(id: number | string, data: any) {
    const res = await http.put(`/presencas/${id}`, data);
    return res.data;
  },

  async delete(id: number | string) {
    // returns 204, so no json
    const res = await http.delete(`/presencas/${id}`);
    return res;
  },

  async listByAula(idAula: number | string, params?: any) {
    const res = await http.get(`/presencas/aulas/${idAula}`, { params });
    return res.data;
  },

  async listByAluno(idAluno: number | string, params?: any) {
    const res = await http.get(`/presencas/alunos/${idAluno}`, { params });
    return res.data;
  },

  async bulkCreate(items: Array<{
    idAluno: number | string;
    idAula: number | string;
    status: "presente" | "falta" | "atraso" | "falta_justificada";
    data_registro?: string;
    observacao?: string;
  }>) {
    const res = await http.post("/presencas/bulk", items);
    return res.data;
  },
};
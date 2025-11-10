import { http } from "../lib/http";
import { ResponseSuccess } from "./users";
import { Assistido, AssistidosResponse } from "../types/assistido";

const assistidoService = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const res = await http.get<ResponseSuccess<AssistidosResponse>>("/assistidos", { params });
    return res.data.dados;
  },

  async getById(id: number | string) {
    const res = await http.get<ResponseSuccess<{ assistido: Assistido }>>(`/assistidos/${id}`);
    return res.data.dados.assistido;
  },

  async create(data: Omit<Assistido, "id" | "created_at" | "updated_at">) {
    const res = await http.post<ResponseSuccess<Assistido>>("/assistidos", data);
    return res.data.dados;
  },

  async update(id: number | string, data: Partial<Omit<Assistido, "id" | "created_at" | "updated_at">>) {
    const res = await http.put<ResponseSuccess<Assistido>>(`/assistidos/${id}`, data);
    return res.data.dados;
  },

  async delete(id: number | string) {
    await http.delete(`/assistidos/${id}`);
  }
};

export default assistidoService;
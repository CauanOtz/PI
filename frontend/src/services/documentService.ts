// ...new file...
import { http } from "../lib/http";
import { ResponseSuccess } from "./users";

export interface Documento {
  id: number;
  idAluno: number;
  nome: string;
  descricao?: string;
  tipo: string;
  tamanho: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * documentService - wrapper simples para endpoints do backend relacionados a documentos
 * Endpoints esperados:
 *  POST   /alunos/:alunoId/documentos          (multipart/form-data)  -> upload
 *  GET    /alunos/:alunoId/documentos          -> list
 *  GET    /alunos/:alunoId/documentos/:id/download -> download (blob)
 *  PUT    /alunos/:alunoId/documentos/:id      -> update metadata
 *  DELETE /alunos/:alunoId/documentos/:id      -> delete
 */

const buildBase = (alunoId: number | string) => `/alunos/${alunoId}/documentos`;

export const documentService = {
  async uploadDocument(alunoId: number | string, file: File, descricao?: string, extra: Record<string, any> = {}) {
    const fd = new FormData();
    fd.append("documento", file);
    if (descricao) fd.append("descricao", descricao);
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });

    const res = await http.post<ResponseSuccess<Documento>>(buildBase(alunoId), fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.dados;
  },

  async listDocuments(alunoId: number | string) {
    const res = await http.get<ResponseSuccess<{ documentos: Documento[] }>>(buildBase(alunoId));
    return res.data.dados.documentos;
  },

  async downloadDocument(alunoId: number | string, documentoId: number | string) {
    const url = `${buildBase(alunoId)}/${documentoId}/download`;
    const res = await http.get<Blob>(url, { responseType: "blob" });
    return res.data;
  },

  async updateDocument(alunoId: number | string, documentoId: number | string, payload: Partial<Documento>) {
    const url = `${buildBase(alunoId)}/${documentoId}`;
    const res = await http.put<ResponseSuccess<Documento>>(url, payload);
    return res.data.dados;
  },

  async deleteDocument(alunoId: number | string, documentoId: number | string) {
    const url = `${buildBase(alunoId)}/${documentoId}`;
    await http.delete<ResponseSuccess<void>>(url);
    return;
  }
};
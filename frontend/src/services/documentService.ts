// ...new file...
import { http } from "../lib/http";
import { ResponseSuccess } from "./users";

export interface Documento {
  id: number;
  idAssistido: number;
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
 *  POST   /assistidos/:assistidoId/documentos          (multipart/form-data)  -> upload
 *  GET    /assistidos/:assistidoId/documentos          -> list
 *  GET    /assistidos/:assistidoId/documentos/:id/download -> download (blob)
 *  PUT    /assistidos/:assistidoId/documentos/:id      -> update metadata
 *  DELETE /assistidos/:assistidoId/documentos/:id      -> delete
 */

const buildBase = (assistidoId: number | string) => `/assistidos/${assistidoId}/documentos`;

export const documentService = {
  async uploadDocument(assistidoId: number | string, file: File, extra: Record<string, any> = {}) {
    const fd = new FormData();
    fd.append("documento", file);
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });

    const res = await http.post<ResponseSuccess<Documento>>(buildBase(assistidoId), fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.dados;
  },

  async listDocuments(assistidoId: number | string) {
    const res = await http.get<ResponseSuccess<{ documentos: Documento[] }>>(buildBase(assistidoId));
    return res.data.dados.documentos;
  },

  async downloadDocument(assistidoId: number | string, documentoId: number | string) {
    const url = `${buildBase(assistidoId)}/${documentoId}/download`;
    const res = await http.get<Blob>(url, { responseType: "blob" });
    return res.data;
  },

  async updateDocument(assistidoId: number | string, documentoId: number | string, payload: Partial<Documento>) {
    const url = `${buildBase(assistidoId)}/${documentoId}`;
    const res = await http.put<ResponseSuccess<Documento>>(url, payload);
    return res.data.dados;
  },

  async deleteDocument(assistidoId: number | string, documentoId: number | string) {
    const url = `${buildBase(assistidoId)}/${documentoId}`;
    await http.delete<ResponseSuccess<void>>(url);
    return;
  }
};
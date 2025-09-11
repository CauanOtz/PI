// ...new file...
import { http } from "../lib/http";

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
    // append extras if needed (categoria, tipo, etc)
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });

    const res = await http.post(buildBase(alunoId), fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async listDocuments(alunoId: number | string) {
    const res = await http.get(buildBase(alunoId));
    return res.data;
  },

  async downloadDocument(alunoId: number | string, documentoId: number | string) {
    const url = `${buildBase(alunoId)}/${documentoId}/download`;
    const res = await http.get(url, { responseType: "blob" });
    return res.data; // Blob
  },

  async updateDocument(alunoId: number | string, documentoId: number | string, payload: Record<string, any>) {
    const url = `${buildBase(alunoId)}/${documentoId}`;
    const res = await http.put(url, payload);
    return res.data;
  },

  async deleteDocument(alunoId: number | string, documentoId: number | string) {
    const url = `${buildBase(alunoId)}/${documentoId}`;
    await http.delete(url);
    return;
  }
};
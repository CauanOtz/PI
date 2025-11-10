// src/dto/DocumentoDTO.js
export default class DocumentoDTO {
  constructor(model, opts = {}) {
    if (!model) return;
    this.id = model.id;
    this.nome = model.nome;
    this.descricao = model.descricao ?? null;
    this.tipo = model.tipo;
    this.assistidoId = model.assistidoId;
    this.usuarioId = model.usuarioId;
    this.dataUpload = model.createdAt;
    this.ativo = model.ativo ?? true;

    // Não exponha o caminho físico do arquivo
    if (opts.makeDownloadUrl && this.assistidoId && this.id) {
      const base = opts.baseUrl || `/api/v2/assistidos`;
      this.downloadUrl = `${base}/${this.assistidoId}/documentos/${this.id}/download`;
    }
  }

  static from(model, opts) { return new DocumentoDTO(model, opts); }
  static list(models, opts) {
    return Array.isArray(models) ? models.map((m) => DocumentoDTO.from(m, opts)) : [];
  }
}


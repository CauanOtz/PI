// src/dto/DocumentoDTO.js
export default class DocumentoDTO {
  constructor(model, opts = {}) {
    if (!model) return;
    this.id = model.id;
    this.nome = model.nome;
    this.descricao = model.descricao ?? null;
    this.tipo = model.tipo; // enum de negócio
    this.tamanho = model.tamanho ?? null;
    this.alunoId = model.alunoId;
    this.usuarioId = model.usuarioId;
    this.dataUpload = model.dataUpload ?? model.createdAt ?? model.data_upload ?? null;

    // Não exponha o caminho físico do arquivo
    if (opts.makeDownloadUrl && this.alunoId && this.id) {
      const base = opts.baseUrl || `/api/v2/alunos`;
      this.downloadUrl = `${base}/${this.alunoId}/documentos/${this.id}/download`;
    }
  }

  static from(model, opts) { return new DocumentoDTO(model, opts); }
  static list(models, opts) {
    return Array.isArray(models) ? models.map((m) => DocumentoDTO.from(m, opts)) : [];
  }
}


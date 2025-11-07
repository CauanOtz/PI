// src/dto/AtividadeDTO.js
export default class AtividadeDTO {
  constructor(model) {
    if (!model) return;
    this.id = model.id;
    this.titulo = model.titulo ?? null;
    this.data = model.data ?? null;
    this.horario = model.horario ?? null;
    this.descricao = model.descricao ?? null;
    this.createdAt = model.createdAt ?? model.created_at ?? null;
    this.updatedAt = model.updatedAt ?? model.updated_at ?? null;
  }

  static from(model) { return new AtividadeDTO(model); }
  static list(models) { return Array.isArray(models) ? models.map(AtividadeDTO.from) : []; }
}

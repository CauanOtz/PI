// src/dto/AlunoDTO.js
import UsuarioDTO from './UsuarioDTO.js';

export default class AlunoDTO {
  constructor(model, opts = {}) {
    if (!model) return;
    this.id = model.id;
    this.nome = model.nome;
    this.idade = model.idade;
    this.endereco = model.endereco ?? null;
    this.contato = model.contato ?? null;
    this.createdAt = model.createdAt ?? model.created_at ?? null;
    this.updatedAt = model.updatedAt ?? model.updated_at ?? null;

    if (opts.includeResponsaveis && model.responsaveis) {
      this.responsaveis = UsuarioDTO.list(model.responsaveis);
    }
  }

  static from(model, opts) {
    return new AlunoDTO(model, opts);
  }

  static list(models, opts) {
    return Array.isArray(models) ? models.map((m) => AlunoDTO.from(m, opts)) : [];
  }
}


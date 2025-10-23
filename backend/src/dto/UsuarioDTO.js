// src/dto/UsuarioDTO.js
export default class UsuarioDTO {
  constructor(model) {
    if (!model) return;
    this.id = model.id;
    this.nome = model.nome;
    this.email = model.email;
    this.telefone = model.telefone ?? null;
    this.cpf = model.cpf ?? null;
    this.role = model.role;
    this.createdAt = model.createdAt ?? model.created_at ?? null;
    this.updatedAt = model.updatedAt ?? model.updated_at ?? null;
  }

  static from(model) {
    return new UsuarioDTO(model);
  }

  static list(models) {
    return Array.isArray(models) ? models.map((m) => UsuarioDTO.from(m)) : [];
  }
}


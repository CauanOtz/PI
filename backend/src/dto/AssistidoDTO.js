// src/dto/AssistidoDTO.js
import UsuarioDTO from './UsuarioDTO.js';

export default class AssistidoDTO {
  constructor(model, opts = {}) {
    if (!model) return;
    
    this.id = model.id;
    this.nome = model.nome;
    this.dataNascimento = model.dataNascimento ?? model.data_nascimento ?? null;
    this.sexo = model.sexo ?? null;
    this.cartaoSus = model.cartaoSus ?? model.cartao_sus ?? null;
    this.rg = model.rg ?? null;
    this.endereco = model.endereco ?? null;
    this.bairro = model.bairro ?? null;
    this.cep = model.cep ?? null;
    this.cidade = model.cidade ?? null;
    this.contato = model.contato ?? null;
    this.problemasSaude = model.problemasSaude ?? model.problemas_saude ?? null;
    this.pai = model.pai ?? null;
    this.mae = model.mae ?? null;
    this.createdAt = model.createdAt ?? model.created_at ?? null;
    this.updatedAt = model.updatedAt ?? model.updated_at ?? null;

    // Removida a inclusão de responsáveis
  }

  static from(model, opts) {
    return new AssistidoDTO(model, opts);
  }

  static list(models, opts) {
    return Array.isArray(models) ? models.map((m) => AssistidoDTO.from(m, opts)) : [];
  }
}
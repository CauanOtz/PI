// src/dto/AssistidoDTO.js
import EnderecoDTO from './EnderecoDTO.js';
import ContatoAssistidoDTO from './ContatoAssistidoDTO.js';
import FiliacaoAssistidoDTO from './FiliacaoAssistidoDTO.js';

export default class AssistidoDTO {
  constructor(model, opts = {}) {
    if (!model) return;
    
    this.id = model.id;
    this.nome = model.nome;
    this.dataNascimento = model.dataNascimento ?? model.data_nascimento ?? null;
    this.sexo = model.sexo ?? null;
    this.cartaoSus = model.cartaoSus ?? model.cartao_sus ?? null;
    this.rg = model.rg ?? null;
    
    // Novo schema normalizado
    this.numero = model.numero ?? null;
    this.complemento = model.complemento ?? null;
    this.problemasSaude = model.problemasSaude ?? model.problemas_saude ?? null;
    
    // Relacionamentos
    if (model.endereco) {
      this.endereco = new EnderecoDTO(model.endereco).toJSON();
    } else {
      this.endereco = null;
    }

    if (model.contatos) {
      this.contatos = ContatoAssistidoDTO.fromArray(model.contatos);
    } else {
      this.contatos = [];
    }

    if (model.filiacao) {
      // Retorna objeto { mae, pai } para compatibilidade
      this.filiacao = FiliacaoAssistidoDTO.toObject(model.filiacao);
    } else {
      this.filiacao = { mae: null, pai: null };
    }

    this.createdAt = model.createdAt ?? model.created_at ?? null;
    this.updatedAt = model.updatedAt ?? model.updated_at ?? null;
  }

  /**
   * Retorna endereço completo formatado
   * @returns {string}
   */
  getEnderecoCompleto() {
    if (!this.endereco) return '';
    const enderecoDTO = new EnderecoDTO(this.endereco);
    return enderecoDTO.toFormattedString(this.numero, this.complemento);
  }

  /**
   * Retorna contato principal (ordem prioridade 1)
   * @returns {Object|null}
   */
  getContatoPrincipal() {
    if (!this.contatos || this.contatos.length === 0) return null;
    return this.contatos.find(c => c.ordemPrioridade === 1) || this.contatos[0];
  }

  static from(model, opts) {
    return new AssistidoDTO(model, opts);
  }

  static list(models, opts) {
    return Array.isArray(models) ? models.map((m) => AssistidoDTO.from(m, opts)) : [];
  }
}
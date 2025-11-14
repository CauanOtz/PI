class ContatoAssistidoDTO {
  constructor(contato) {
    if (!contato) {
      return null;
    }

    this.id = contato.id;
    this.telefone = contato.telefone;
    this.nomeContato = contato.nomeContato || contato.nome_contato;
    this.parentesco = contato.parentesco;
    this.observacao = contato.observacao;
    this.ordemPrioridade = contato.ordemPrioridade || contato.ordem_prioridade;
  }

  toJSON() {
    return {
      id: this.id,
      telefone: this.telefone,
      nomeContato: this.nomeContato,
      parentesco: this.parentesco,
      observacao: this.observacao,
      ordemPrioridade: this.ordemPrioridade
    };
  }

  /**
   * Converte array de contatos em DTOs
   * @param {Array} contatos
   * @returns {Array<ContatoAssistidoDTO>}
   */
  static fromArray(contatos) {
    if (!contatos || !Array.isArray(contatos)) {
      return [];
    }
    return contatos.map(c => new ContatoAssistidoDTO(c).toJSON());
  }
}

export default ContatoAssistidoDTO;

class FiliacaoAssistidoDTO {
  constructor(filiacao) {
    if (!filiacao) {
      return null;
    }

    this.id = filiacao.id;
    this.tipo = filiacao.tipo; // 'mae' ou 'pai'
    this.nomeCompleto = filiacao.nomeCompleto || filiacao.nome_completo;
  }

  toJSON() {
    return {
      id: this.id,
      tipo: this.tipo,
      nomeCompleto: this.nomeCompleto
    };
  }

  /**
   * Converte array de filiação em objeto { mae, pai }
   * @param {Array} filiacoes
   * @returns {{mae: string|null, pai: string|null}}
   */
  static toObject(filiacoes) {
    if (!filiacoes || !Array.isArray(filiacoes)) {
      return { mae: null, pai: null };
    }

    const mae = filiacoes.find(f => f.tipo === 'mae');
    const pai = filiacoes.find(f => f.tipo === 'pai');

    return {
      mae: mae?.nomeCompleto || mae?.nome_completo || null,
      pai: pai?.nomeCompleto || pai?.nome_completo || null
    };
  }

  /**
   * Converte array de filiação em array de DTOs
   * @param {Array} filiacoes
   * @returns {Array<FiliacaoAssistidoDTO>}
   */
  static fromArray(filiacoes) {
    if (!filiacoes || !Array.isArray(filiacoes)) {
      return [];
    }
    return filiacoes.map(f => new FiliacaoAssistidoDTO(f).toJSON());
  }
}

export default FiliacaoAssistidoDTO;

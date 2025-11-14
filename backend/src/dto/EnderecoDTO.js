class EnderecoDTO {
  constructor(endereco) {
    if (!endereco) {
      return null;
    }

    this.id = endereco.id;
    this.cep = endereco.cep;
    this.logradouro = endereco.logradouro;
    this.bairro = endereco.bairro;
    this.cidade = endereco.cidade;
    this.estado = endereco.estado;
  }

  /**
   * Retorna endereço formatado como string
   * @param {string} numero - Número do imóvel
   * @param {string} complemento - Complemento do endereço
   * @returns {string}
   */
  toFormattedString(numero = '', complemento = '') {
    const parts = [];
    
    if (this.logradouro) parts.push(this.logradouro);
    if (numero) parts.push(numero);
    if (complemento) parts.push(complemento);
    if (this.bairro) parts.push(this.bairro);
    if (this.cidade) parts.push(this.cidade);
    if (this.estado) parts.push(this.estado);
    if (this.cep) parts.push(`CEP: ${this.cep}`);

    return parts.join(', ');
  }

  toJSON() {
    return {
      id: this.id,
      cep: this.cep,
      logradouro: this.logradouro,
      bairro: this.bairro,
      cidade: this.cidade,
      estado: this.estado
    };
  }
}

export default EnderecoDTO;

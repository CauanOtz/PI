// src/dto/PaginationDTO.js
export default class PaginationDTO {
  constructor({ total, paginaAtual, totalPaginas, itensPorPagina }) {
    this.total = Number(total) || 0;
    this.paginaAtual = Number(paginaAtual) || 1;
    this.totalPaginas = Number(totalPaginas) || 1;
    this.itensPorPagina = Number(itensPorPagina) || 10;
    this.temProximaPagina = this.paginaAtual < this.totalPaginas;
    this.temPaginaAnterior = this.paginaAtual > 1;
  }

  static fromMeta(meta) { return new PaginationDTO(meta); }
}


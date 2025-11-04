// src/dto/PresencaDTO.js
export default class PresencaDTO {
  constructor(model) {
    if (!model) return;
    this.id = model.id;
    this.idAluno = model.idAluno ?? model.alunoId ?? null;
    this.idAula = model.idAula ?? model.aulaId ?? null;
    this.status = model.status;
    this.dataRegistro = model.dataRegistro ?? model.data_registro ?? model.createdAt ?? null;
    this.observacao = model.observacao ?? null;
  }

  static from(model) { return new PresencaDTO(model); }
  static list(models) { return Array.isArray(models) ? models.map(PresencaDTO.from) : []; }
}



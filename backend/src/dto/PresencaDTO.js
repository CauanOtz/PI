// src/dto/PresencaDTO.js
export default class PresencaDTO {
  constructor(model) {
    if (!model) return;
    this.id = model.id;
    this.idAssistido = model.idAssistido ?? model.id_assistido ?? null;
    this.idAtividade = model.idAtividade ?? model.id_atividade ?? null;
    this.status = model.status;
    this.dataRegistro = model.dataRegistro ?? model.data_registro ?? model.createdAt ?? null;
    this.observacao = model.observacao ?? null;
  }

  static from(model) { return new PresencaDTO(model); }
  static list(models) { return Array.isArray(models) ? models.map(PresencaDTO.from) : []; }
}



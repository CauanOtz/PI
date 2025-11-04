// src/dto/NotificacaoDTO.js
export default class NotificacaoDTO {
  constructor(model, opts = {}) {
    if (!model) return;
    this.id = model.id;
    this.titulo = model.titulo ?? model.assunto ?? null;
    this.mensagem = model.mensagem ?? model.conteudo ?? null;
    this.tipo = model.tipo ?? 'info';
    this.createdAt = model.createdAt ?? model.created_at ?? null;

    if (opts.includeDestinatarios && Array.isArray(model.destinatarios)) {
      this.destinatarios = model.destinatarios.map((d) => ({ id: d.id, nome: d.nome }));
    }
  }

  static from(model, opts) { return new NotificacaoDTO(model, opts); }
  static list(models, opts) { return Array.isArray(models) ? models.map((m) => NotificacaoDTO.from(m, opts)) : []; }
}


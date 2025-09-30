import { http } from '../lib/http';
import { NotificacaoBase, NotificacaoUpdatePayload } from '../types/notifications';

const unwrap = (res: any) => res?.data ?? res;

const extractArray = (payload: any): NotificacaoBase[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as NotificacaoBase[];
  if (Array.isArray(payload?.notificacoes)) return payload.notificacoes as NotificacaoBase[];
  if (Array.isArray(payload?.dados?.notificacoes)) return payload.dados.notificacoes as NotificacaoBase[];
  if (Array.isArray(payload?.rows)) return payload.rows as NotificacaoBase[];
  if (Array.isArray(payload?.dados?.rows)) return payload.dados.rows as NotificacaoBase[];
  return [];
};

export const notificacaoService = {
  async list(page: number = 1, limit: number = 20): Promise<NotificacaoBase[]> {
    const res = await http.get('/notificacoes', { params: { page, limit } });
    return extractArray(unwrap(res));
  },

  async listMinhas(page: number = 1, limit: number = 20): Promise<NotificacaoBase[]> {
    const res = await http.get('/notificacoes/minhas', { params: { page, limit } });
    return extractArray(unwrap(res));
  },

  async listByCpf(cpf: string, page: number = 1, limit: number = 20): Promise<NotificacaoBase[]> {
    const res = await http.get(`/notificacoes/usuarios/${encodeURIComponent(cpf)}/notificacoes`, {
      params: { page, limit },
    });
    return extractArray(unwrap(res));
  },

  async markAsRead(notificacaoId: string) {
    // endpoint: POST /notificacoes/:idNotificacao/marcar-lida
    const res = await http.post(`/notificacoes/${notificacaoId}/marcar-lida`);
    return res?.data;
  },

  async delete(notificacaoId: string) {
    const res = await http.delete(`/notificacoes/${notificacaoId}`);
    return res?.data;
  },

  async update(notificacaoId: string, data: NotificacaoUpdatePayload) {
    const payload: NotificacaoUpdatePayload = { ...data };
    // Normaliza campo vazio de dataExpiracao para null (remover expiração)
    if (payload.dataExpiracao === '') payload.dataExpiracao = null;
    const res = await http.put(`/notificacoes/${notificacaoId}`, payload);
    return res?.data;
  },

  async enviar(notificacaoId: string, usuarios: string[]) {
    const res = await http.post(`/notificacoes/${notificacaoId}/enviar`, { usuarios });
    return res?.data;
  }
};

export default notificacaoService;

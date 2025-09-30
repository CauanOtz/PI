import { http } from '../lib/http';

const unwrap = (res: any) => res?.data ?? res;

const extractArray = (payload: any) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.notificacoes)) return payload.notificacoes;
  if (Array.isArray(payload?.dados?.notificacoes)) return payload.dados.notificacoes;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.dados?.rows)) return payload.dados.rows;
  return [];
};

export const notificacaoService = {
  async list(page: number = 1, limit: number = 20) {
    const res = await http.get('/notificacoes', { params: { page, limit } });
    return extractArray(unwrap(res));
  },

  async listMinhas(page: number = 1, limit: number = 20) {
    const res = await http.get('/notificacoes/minhas', { params: { page, limit } });
    return extractArray(unwrap(res));
  },

  async listByCpf(cpf: string, page: number = 1, limit: number = 20) {
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

  async enviar(notificacaoId: string, usuarios: string[]) {
    const res = await http.post(`/notificacoes/${notificacaoId}/enviar`, { usuarios });
    return res?.data;
  }
};

export default notificacaoService;

import { http } from '../lib/http';
import { ResponseSuccess } from '../types/api';
import { 
  NotificacaoBase, 
  NotificacaoUpdatePayload 
} from '../types/notifications';
import { 
  NotificacaoCriadaResponse, 
  NotificacaoListResponse,
  NotificacaoUsuariosResponse 
} from '../types/notificacao';

export const notificacaoService = {
  async create(payload: {
    titulo: string;
    mensagem: string;
    tipo: string;
    dataExpiracao?: string;
  }): Promise<NotificacaoCriadaResponse> {
    const res = await http.post<ResponseSuccess<NotificacaoCriadaResponse>>('/notificacoes', payload);
    return res.data.dados;
  },

  async list(page: number = 1, limit: number = 20): Promise<NotificacaoListResponse> {
    const res = await http.get<ResponseSuccess<NotificacaoListResponse>>('/notificacoes', { 
      params: { page, limit } 
    });
    return res.data.dados;
  },

  async listMinhas(page: number = 1, limit: number = 20): Promise<NotificacaoListResponse> {
    const res = await http.get<ResponseSuccess<NotificacaoListResponse>>('/notificacoes/minhas', { 
      params: { page, limit } 
    });
    return res.data.dados;
  },

  async listByCpf(cpf: string, page: number = 1, limit: number = 20): Promise<NotificacaoListResponse> {
    const res = await http.get<ResponseSuccess<NotificacaoListResponse>>(
      `/notificacoes/usuarios/${encodeURIComponent(cpf)}/notificacoes`,
      { params: { page, limit } }
    );
    return res.data.dados;
  },

  async markAsRead(notificacaoId: string) {
    const res = await http.post<ResponseSuccess<{ mensagem: string }>>(`/notificacoes/${notificacaoId}/marcar-lida`);
    return res.data.dados;
  },

  async delete(notificacaoId: string) {
    const res = await http.delete<ResponseSuccess<{ mensagem: string }>>(`/notificacoes/${notificacaoId}`);
    return res.data.dados;
  },

  async listUsuariosNotificacao(notificacaoId: string, page: number = 1, limit: number = 50) {
    const res = await http.get<ResponseSuccess<NotificacaoUsuariosResponse>>(`/notificacoes/${notificacaoId}/usuarios`, { params: { page, limit } });
    return res.data.dados;
  },

  async update(notificacaoId: string, data: NotificacaoUpdatePayload) {
    const payload: NotificacaoUpdatePayload = { ...data };
    if (payload.dataExpiracao === '') payload.dataExpiracao = null;
    const res = await http.put<ResponseSuccess<NotificacaoBase>>(`/notificacoes/${notificacaoId}`, payload);
    return res.data.dados;
  },

  async enviar(notificacaoId: string, usuarios: string[]) {
    const res = await http.post<ResponseSuccess<{ mensagem: string }>>(`/notificacoes/${notificacaoId}/enviar`, { 
      usuarios: usuarios 
    });
    return res.data.dados;
  }
};

export default notificacaoService;

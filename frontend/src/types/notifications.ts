export const NOTIFICACAO_TIPOS = ['info', 'alerta', 'urgente', 'sistema'] as const;
export type NotificacaoTipo = typeof NOTIFICACAO_TIPOS[number];

export interface NotificacaoBase {
  id: number | string;
  titulo: string;
  mensagem: string;
  tipo: NotificacaoTipo;
  dataExpiracao?: string | null;
  createdAt?: string;
  dataEnvio?: string;
  criadoEm?: string;
  destinatarios?: any[];
  usuarios?: any[];
  UsuarioNotificacoes?: any[];
  usuarioNotificacoes?: any[];
}

export interface NotificacaoUpdatePayload {
  titulo?: string;
  mensagem?: string;
  tipo?: NotificacaoTipo;
  dataExpiracao?: string | null;
}

export interface NotificacaoEnviarPayload {
  usuarios: string[]; // CPFs formatados
}

export interface NotificacaoListResponseWrapper {
  notificacoes?: NotificacaoBase[];
  rows?: NotificacaoBase[];
  dados?: { notificacoes?: NotificacaoBase[]; rows?: NotificacaoBase[] };
  data?: any;
}
export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning';
  read: boolean;
}
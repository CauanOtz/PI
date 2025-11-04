import { Paginacao } from './api';
import { NotificacaoBase, NotificacaoUpdatePayload } from './notifications';

export interface Notificacao extends NotificacaoBase {
  createdAt: string;
  updatedAt: string;
}

export interface NotificacaoCriadaResponse {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  dataExpiracao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificacaoListResponse {
  notificacoes: NotificacaoBase[];
  paginacao: Paginacao;
}

export interface NotificacaoUsuariosResponse {
  usuarios: any[];
  paginacao: Paginacao;
}

export type { NotificacaoUpdatePayload } from './notifications';
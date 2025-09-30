import { Button } from '../ui/button';
import { StatusBadge } from '../ui/StatusBadge';
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react';

export interface NotificationRow {
  id: number;
  titulo?: string;
  title?: string;
  mensagem?: string;
  tipo?: string;
  type?: string;
  dataExpiracao?: string | null;
  createdAt?: string;
  criadoEm?: string;
  dataEnvio?: string;
  destinatarios?: any[];
  usuarios?: any[];
  UsuarioNotificacoes?: any[];
  usuarioNotificacoes?: any[];
}

interface NotificationsTableProps {
  items: NotificationRow[];
  editingId: number | null;
  savingEdit: boolean;
  deletingId: number | null;
  editFields: { titulo: string; mensagem: string; tipo: string; dataExp: string };
  onChangeEdit: (patch: Partial<{ titulo: string; mensagem: string; tipo: string; dataExp: string }>) => void;
  onOpenEdit: (n: NotificationRow) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (n: NotificationRow) => void;
}

export function NotificationsTable({
  items,
  editingId,
  savingEdit,
  deletingId,
  editFields,
  onChangeEdit,
  onOpenEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: NotificationsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Título</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Criada em</th>
            <th className="px-4 py-2">Destinatários</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((notif) => {
            const createdAt = notif.criadoEm || notif.createdAt || notif.dataEnvio;
            const destinatarios =
              notif.destinatarios?.length ??
              notif.usuarios?.length ??
              notif.UsuarioNotificacoes?.length ??
              notif.usuarioNotificacoes?.length ??
              0;
            const expirou = notif.dataExpiracao && new Date(notif.dataExpiracao).getTime() < Date.now();
            const isEditing = editingId === notif.id;
            return (
              <tr key={notif.id} className="border-t">
                <td className="px-4 py-2 font-medium text-gray-800">
                  {isEditing ? (
                    <input
                      value={editFields.titulo}
                      onChange={e => onChangeEdit({ titulo: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    notif.titulo ?? notif.title ?? '—'
                  )}
                </td>
                <td className="px-4 py-2 capitalize">
                  {isEditing ? (
                    <select
                      value={editFields.tipo}
                      onChange={e => onChangeEdit({ tipo: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {['info','alerta','urgente','sistema'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    notif.tipo ?? notif.type ?? 'info'
                  )}
                </td>
                <td className="px-4 py-2">{createdAt ? new Date(createdAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-2">{destinatarios}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={expirou ? 'expirada' : 'ativa'} />
                </td>
                <td className="px-4 py-2 whitespace-nowrap align-top">
                  {isEditing ? (
                    <div className="flex flex-col gap-2 w-56">
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          type="button"
                          disabled={savingEdit}
                          onClick={onSaveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {savingEdit ? 'Salvando' : (
                            <span className="flex items-center gap-1"><CheckIcon className="w-4 h-4" />Salvar</span>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={savingEdit}
                          onClick={onCancelEdit}
                          className="border-gray-300"
                        >
                          <span className="flex items-center gap-1"><XIcon className="w-4 h-4" />Cancelar</span>
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <textarea
                          value={editFields.mensagem}
                          onChange={e => onChangeEdit({ mensagem: e.target.value })}
                          rows={3}
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="Mensagem"
                        />
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-1">Data Expiração</label>
                          <input
                            type="datetime-local"
                            value={editFields.dataExp}
                            onChange={e => onChangeEdit({ dataExp: e.target.value })}
                            className="w-full border rounded px-2 py-1 text-xs"
                          />
                          {editFields.dataExp && (
                            <button
                              type="button"
                              className="mt-1 text-[10px] text-red-600 underline"
                              onClick={() => onChangeEdit({ dataExp: '' })}
                            >Remover expiração</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenEdit(notif)}
                        className="text-blue-600 hover:text-blue-700"
                        aria-label="Editar notificação"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === notif.id}
                        onClick={() => onDelete(notif)}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        aria-label="Excluir notificação"
                      >
                        {deletingId === notif.id ? (
                          <span className="text-[10px] px-1">...</span>
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

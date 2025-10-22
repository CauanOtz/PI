import { useEffect, useState } from 'react';
import { SidebarSection } from '../../components/layout/SidebarSection';
import { usuariosService, BackendUsuario } from '../../services/users';
import { notificacaoService } from '../../services/notificacao';
import { http } from '../../lib/http';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '../../components/modals/shared/DeleteConfirmationModal';
import { UsersIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
// StatusBadge now handled inside table component
import { NotificationEditor } from '../../components/notifications/NotificationEditor';
import { NotificationsTable } from '../../components/notifications/NotificationsTable';
import { extractErrorMessage } from '../../lib/errors';
import { formatCPF } from '../../lib/format';

// CPF format uses shared helper now (formatCPF)

const tipos = ['info', 'alerta', 'urgente', 'sistema'] as const;

export const NotificationsAdmin = (): JSX.Element => {
  const navigate = useNavigate();
  const [editorValues, setEditorValues] = useState({ titulo: '', mensagem: '', tipo: 'info', dataExpiracao: undefined as string | undefined });
  const [responsaveis, setResponsaveis] = useState<BackendUsuario[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editMensagem, setEditMensagem] = useState('');
  const [editTipo, setEditTipo] = useState<typeof tipos[number]>('info');
  const [editDataExp, setEditDataExp] = useState<string | ''>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const filteredResponsaveis = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return responsaveis;
    return responsaveis.filter(r => ((r.nome || '') as string).toLowerCase().includes(q) || (r.cpf || '').includes(q));
  })();

  useEffect(() => {
    (async () => {
      try {
  const res = await usuariosService.list({ page: 1, limit: 100, role: 'responsavel' });
        // usuariosService.list returns { usuarios?, total? }
        const arr = (res && (res.usuarios || res)) as BackendUsuario[];
        if (Array.isArray(arr) && arr.length > 0) {
          setResponsaveis(arr);
          return;
        }

        const candidates = [
          '/usuarios',
          '/usuarios/list',
          '/usuarios?role=responsavel',
        ];
        for (const path of candidates) {
          try {
            const r = await http.get(path, { params: { page: 1, limit: 100, role: 'responsavel' } }).then(x => x.data);
            const arr2 = r?.usuarios ?? r?.rows ?? r?.data ?? r?.dados ?? r;
            if (Array.isArray(arr2) && arr2.length > 0) {
              setResponsaveis(arr2 as BackendUsuario[]);
              return;
            }
          } catch (innerErr) {
            console.debug('Fallback usuarios candidate failed', path, String((innerErr as any)?.response?.status ?? (innerErr as any)?.message ?? innerErr));
          }
        }

        console.warn('Nenhum responsável encontrado nas respostas. Última resposta:', res);
        setResponsaveis([]);
      } catch (err: any) {
        console.error('Erro ao carregar responsáveis:', err);
        toast.error(extractErrorMessage(err, 'Falha ao carregar responsáveis'));
      }
    })();
  }, []);

  const toggleSelect = (cpf?: string) => {
    if (!cpf) return;
    setSelected((prev) => (prev.includes(cpf) ? prev.filter(c => c !== cpf) : [...prev, cpf]));
  };

  const selectAllVisible = (visible: BackendUsuario[]) => {
    const visibleCpfs = visible.map(v => v.cpf).filter(Boolean) as string[];
    const allSelected = visibleCpfs.every(c => selected.includes(c));
    if (allSelected) {
      setSelected(prev => prev.filter(c => !visibleCpfs.includes(c)));
    } else {
      setSelected(prev => Array.from(new Set([...prev, ...visibleCpfs])));
    }
  };

  const submitEditor = async () => {
    const { titulo, mensagem, tipo, dataExpiracao } = editorValues;
    if (!titulo.trim() || !mensagem.trim()) return toast.error('Título e mensagem são obrigatórios');
    setLoading(true);
    try {
      const payload: any = { titulo, mensagem, tipo };
      if (dataExpiracao) payload.dataExpiracao = dataExpiracao;
      const created = await http.post('/notificacoes', payload).then(r => r.data);
      const id = created?.notificacao?.id ?? created?.id ?? created?.data?.id;
      if (!id) {
        toast.success('Notificação criada, mas não foi possível obter o ID para envio');
        return;
      }
      if (selected.length > 0) {
        // Delegamos a validação de CPF ao backend;aqui apenas formatamos.
        const formattedCpfs = selected.map(s => formatCPF(s));
        try {
          const sendRes = await notificacaoService.enviar(String(id), formattedCpfs);
          const successMessage = sendRes?.mensagem ?? created?.mensagem ?? 'Notificação enviada com sucesso';
          // Info extra: quantos novos vínculos vs existentes
          if (sendRes?.novasAssociacoes !== undefined) {
            toast.success(`${successMessage} (novos: ${sendRes.novasAssociacoes}, existentes: ${sendRes.associacoesExistentes})`);
          } else {
            toast.success(String(successMessage));
          }
        } catch (sendErr: any) {
          const data = sendErr?.response?.data;
          if (data?.usuariosNaoEncontrados?.length) {
            toast.error(`Alguns usuários não encontrados: ${data.usuariosNaoEncontrados.join(', ')}`);
          } else if (data?.mensagem) {
            toast.error(String(data.mensagem));
          } else {
            toast.error('Falha ao enviar para destinatários');
          }
          // Mantemos a notificação criada (rascunho) sem destinatários.
          console.warn('Falha no envio de destinatários. Notificação permanece sem destinatários.', sendErr);
        }
      } else {
        toast.success('Notificação criada como rascunho (sem destinatários)');
      }
      // limpar formulário independentemente do sucesso de envio
      setEditorValues({ titulo: '', mensagem: '', tipo: 'info', dataExpiracao: undefined });
      setSelected([]);
    } catch (err: any) {
      console.error('Falha ao criar/enviar notificação', err);
      toast.error(extractErrorMessage(err, 'Falha ao criar/enviar notificação'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAllNotifications = async () => {
    if (showAll) {
      setShowAll(false);
      return;
    }

    setListLoading(true);
    try {
      const limit = 100;
      const list = await notificacaoService.list(1, limit);
      setAllNotifications(Array.isArray(list) ? list : []);
      setShowAll(true);
    } catch (err: any) {
      console.error('Falha ao carregar notificações:', err);
      toast.error(extractErrorMessage(err, 'Falha ao carregar notificações'));
    } finally {
      setListLoading(false);
    }
  };

  const openEdit = (notif: any) => {
    setEditingId(notif.id);
    setEditTitulo(notif.titulo || '');
    setEditMensagem(notif.mensagem || '');
    setEditTipo((notif.tipo || 'info') as any);
    if (notif.dataExpiracao) {
      // Ajusta para input datetime-local (sem segundos/Z)
      const dt = new Date(notif.dataExpiracao);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0,16);
      setEditDataExp(local);
    } else {
      setEditDataExp('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitulo('');
    setEditMensagem('');
    setEditTipo('info');
    setEditDataExp('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editTitulo.trim() || !editMensagem.trim()) return toast.error('Título e mensagem são obrigatórios');
    setSavingEdit(true);
    try {
      const payload: any = {
        titulo: editTitulo.trim(),
        mensagem: editMensagem.trim(),
        tipo: editTipo,
      };
      if (editDataExp) payload.dataExpiracao = new Date(editDataExp).toISOString(); else payload.dataExpiracao = null;
      const res = await notificacaoService.update(String(editingId), payload);
      // Atualiza estado local
      setAllNotifications(prev => prev.map(n => n.id === editingId ? { ...n, ...payload } : n));
      toast.success(res?.mensagem || 'Notificação atualizada');
      cancelEdit();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Falha ao salvar edição'));
    } finally {
      setSavingEdit(false);
    }
  };

  const openDeleteModal = (notif: any) => {
    setDeleteTarget(notif);
    setDeleteModalOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTarget) return;
    const notif = deleteTarget;
    setDeletingId(notif.id);
    try {
      const res = await notificacaoService.delete(String(notif.id));
      setAllNotifications(prev => prev.filter(n => n.id !== notif.id));
      if (editingId === notif.id) cancelEdit();
      toast.success(res?.mensagem || 'Notificação excluída');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Falha ao excluir'));
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen mt-16">
      <div className="bg-gray-50 overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <main className="p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">Enviar Notificação (Admin)</h1>
            <button
              type="button"
              onClick={handleToggleAllNotifications}
              className="px-3 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
            >
              {showAll ? 'Ocultar notificações' : 'Ver todas as notificações'}
            </button>
          </div>
          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <NotificationEditor
                  values={editorValues}
                  tipos={tipos}
                  loading={loading}
                  onChange={patch => setEditorValues(v => ({ ...v, ...patch }))}
                  onSubmit={submitEditor}
                  onReset={() => setEditorValues({ titulo: '', mensagem: '', tipo: 'info', dataExpiracao: undefined })}
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >Cancelar</Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><UsersIcon className="w-4 h-4 text-blue-600" /> Destinatários</h3>
                    <span className="text-[11px] text-gray-500">{selected.length} selecionado(s)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      placeholder="Buscar responsável..."
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllVisible(filteredResponsaveis)}
                    >
                      Selecionar visíveis
                    </Button>
                  </div>
                  <div className="relative flex-1">
                    <div className="max-h-64 overflow-y-auto border rounded p-2 space-y-1 bg-gray-50/60">
                      {responsaveis.length === 0 && (
                        <div className="text-sm text-gray-500 p-4 text-center">Nenhum responsável cadastrado</div>
                      )}
                      {filteredResponsaveis.map(r => {
                        const checked = selected.includes(r.cpf || '');
                        return (
                          <label
                            key={r.cpf ?? r.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs md:text-sm transition-colors ${checked ? 'bg-blue-50 border border-blue-200' : 'hover:bg-white'}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelect(r.cpf)}
                              className="accent-blue-600"
                            />
                            <span className="flex-1 truncate">{r.nome} {r.cpf ? `(${r.cpf})` : ''}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {selected.length > 0 && (
                    <div className="pt-3 flex justify-between items-center text-[11px] text-gray-500">
                      <span>{selected.length} destinatário(s) prontos para envio</span>
                      <button
                        type="button"
                        onClick={() => setSelected([])}
                        className="text-red-600 hover:underline"
                      >Limpar seleção</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showAll && (
            <section className="mt-10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold mb-3">Todas as notificações</h2>
                <span className="text-xs text-gray-500">
                  Exibindo últimas {allNotifications.length} (máximo 100)
                </span>
              </div>
              {listLoading ? (
                <div className="text-sm text-gray-500">Carregando notificações...</div>
              ) : allNotifications.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhuma notificação encontrada.</div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
                  <div className="min-w-[780px]">
                    <NotificationsTable
                      items={allNotifications}
                      editingId={editingId}
                      savingEdit={savingEdit}
                      deletingId={deletingId}
                      editFields={{ titulo: editTitulo, mensagem: editMensagem, tipo: editTipo, dataExp: editDataExp }}
                      onChangeEdit={patch => {
                        if (patch.titulo !== undefined) setEditTitulo(patch.titulo);
                        if (patch.mensagem !== undefined) setEditMensagem(patch.mensagem);
                        if (patch.tipo !== undefined) setEditTipo(patch.tipo as any);
                        if (patch.dataExp !== undefined) setEditDataExp(patch.dataExp);
                      }}
                      onOpenEdit={openEdit as any}
                      onCancelEdit={cancelEdit}
                      onSaveEdit={saveEdit}
                      onDelete={openDeleteModal as any}
                    />
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => { if (!deletingId) { setDeleteModalOpen(false); setDeleteTarget(null); } }}
        onConfirm={performDelete}
        title="Confirmar Exclusão"
        description={deleteTarget ? `Tem certeza que deseja remover a notificação "${deleteTarget.titulo || deleteTarget.title || ''}"? Esta ação não pode ser desfeita.` : 'Tem certeza que deseja remover esta notificação?'}
      />
    </div>
  );
};

export default NotificationsAdmin;

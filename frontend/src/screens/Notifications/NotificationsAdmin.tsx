import React, { useEffect, useState } from 'react';
import { SidebarSection } from '../../components/layout/SidebarSection';
import { usuariosService, BackendUsuario } from '../../services/users';
import { notificacaoService } from '../../services/notificacao';
import { http } from '../../lib/http';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const cleanDigits = (value: string) => (value || '').toString().replace(/\D/g, '');
const formatCPF = (value: string) => {
  const d = cleanDigits(value);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/(\d{3})(\d+)/, '$1.$2');
  if (d.length <= 9) return d.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Validação detalhada de CPF delegada ao backend agora; mantemos apenas util de formatação aqui.

const tipos = ['info', 'alerta', 'urgente', 'sistema'] as const;

export const NotificationsAdmin = (): JSX.Element => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [tipo, setTipo] = useState<typeof tipos[number]>('info');
  const [dataExpiracao, setDataExpiracao] = useState<string | undefined>(undefined);
  const [responsaveis, setResponsaveis] = useState<BackendUsuario[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

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
        console.error('Erro ao carregar responsáveis:', err?.response ?? err);
        const msg = err?.response?.data?.message || err?.response?.statusText || err?.message || 'Falha ao carregar responsáveis';
        toast.error(String(msg));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error('Título e mensagem são obrigatórios');
    setLoading(true);
    try {
      const payload: any = { titulo: title, mensagem: message, tipo };
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
      setTitle(''); setMessage(''); setSelected([]); setDataExpiracao(undefined);
    } catch (err) {
      console.error(err);
      toast.error('Falha ao criar/enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen mt-16">
      <div className="bg-gray-50 overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <main className="pl-[320px] p-8">
          <h1 className="text-2xl font-semibold mb-4">Enviar Notificação (Admin)</h1>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mensagem</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-1 block w-full rounded border p-2" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value as any)} className="mt-1 block w-full rounded border p-2">
                  {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Expiração (opcional)</label>
                <input type="datetime-local" value={dataExpiracao ?? ''} onChange={e => setDataExpiracao(e.target.value || undefined)} className="mt-1 block w-full rounded border p-2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Destinatários (Responsáveis)</label>
              <div className="mt-2 flex items-center gap-2">
                <input placeholder="Buscar por nome" value={query} onChange={e => setQuery(e.target.value)} className="px-3 py-1 border rounded flex-1" />
                <button type="button" onClick={() => selectAllVisible(filteredResponsaveis)} className="px-3 py-1 rounded border text-sm">Selecionar visíveis</button>
              </div>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded p-2">
                {responsaveis.length === 0 && <div className="text-sm text-gray-500">Nenhum responsável cadastrado</div>}
                {/** compute filteredResponsaveis */}
                <div className="space-y-1">
                  {filteredResponsaveis.map(r => (
                    <label key={r.cpf ?? r.id} className="flex items-center gap-2 py-1">
                      <input type="checkbox" checked={selected.includes(r.cpf || '')} onChange={() => toggleSelect(r.cpf)} />
                      <span className="text-sm">{r.nome} {r.cpf ? `(${r.cpf})` : ''}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button disabled={loading} type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{loading ? 'Enviando...' : 'Criar e Enviar'}</button>
              <button type="button" onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded border">Cancelar</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default NotificationsAdmin;

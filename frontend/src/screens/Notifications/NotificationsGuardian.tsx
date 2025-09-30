import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  CircleDot,
  MailOpen,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SidebarSection } from '../../components/layout/SidebarSection';
import { useAuth } from '../../context/AuthProvider';
import { notificacaoService } from '../../services/notificacao';
import { toast } from 'sonner';

export const NotificationsGuardian = (): JSX.Element => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<'all' | 'info' | 'alerta' | 'urgente' | 'sistema'>('all');

  const digitsOnly = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\D/g, '');
  };

  const resolveBoolean = (
    ...values: Array<boolean | number | string | null | undefined>
  ): boolean => {
    for (const value of values) {
      if (value === null || value === undefined) continue;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value !== 0;
      if (typeof value === 'string') return value === 'true' || value === '1';
    }
    return false;
  };

  const firstNonNull = <T,>(...values: Array<T | null | undefined>): T | null => {
    for (const value of values) {
      if (value !== null && value !== undefined) {
        return value;
      }
    }
    return null;
  };

  const matchesCpf = (candidate: unknown, target: string): boolean => {
    return !!target && digitsOnly(candidate) === digitsOnly(target);
  };

  const normalizeUsuarioNotificacoes = (relations: any[] | undefined | null) => {
    if (!Array.isArray(relations)) return relations;
    return relations.map((relation) => ({
      ...relation,
      lida: resolveBoolean(relation?.lida),
      dataLeitura: firstNonNull(relation?.dataLeitura),
    }));
  };

  const normalizeNotification = (raw: any, cpf: string) => {
    if (!raw) return raw;
    const cpfDigits = digitsOnly(cpf);
    const directJoin = raw.UsuarioNotificacao || raw.usuarioNotificacao;
    const usuarioNotificacoes = normalizeUsuarioNotificacoes(
      raw.usuarioNotificacoes || raw.UsuarioNotificacoes
    );

    const destinatarios = Array.isArray(raw.destinatarios)
      ? raw.destinatarios.map((dest: any) => {
          const destJoin = dest?.UsuarioNotificacao || dest?.usuarioNotificacao;
          return {
            ...dest,
            UsuarioNotificacao: destJoin
              ? {
                  ...destJoin,
                  lida: resolveBoolean(destJoin.lida),
                  dataLeitura: firstNonNull(destJoin.dataLeitura),
                }
              : destJoin,
          };
        })
      : raw.destinatarios;

    const matchedDestinatario = Array.isArray(destinatarios)
      ? destinatarios.find((dest: any) => matchesCpf(dest?.cpf ?? dest?.cpfUsuario, cpfDigits))
      : undefined;

    const matchedRelation = Array.isArray(usuarioNotificacoes)
      ? usuarioNotificacoes.find((relation: any) =>
          matchesCpf(relation?.cpfUsuario ?? relation?.cpf, cpfDigits)
        )
      : undefined;

    const lida = resolveBoolean(
      raw.lida,
      directJoin?.lida,
      matchedDestinatario?.UsuarioNotificacao?.lida,
      matchedRelation?.lida
    );

    const dataLeitura =
      firstNonNull(
        raw.dataLeitura,
        directJoin?.dataLeitura,
        matchedDestinatario?.UsuarioNotificacao?.dataLeitura,
        matchedRelation?.dataLeitura
      ) ?? null;

    return {
      ...raw,
      destinatarios,
      usuarioNotificacoes,
      lida,
      dataLeitura,
    };
  };

  const normalizeNotifications = (list: any[] | undefined | null, cpf: string) => {
    if (!Array.isArray(list)) return [];
    return list.map((item) => normalizeNotification(item, cpf));
  };

  const loadNotifications = useCallback(async () => {
    const cpf = user?.cpf;
    if (!cpf) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      try {
        const list = await notificacaoService.listMinhas(1, 100);
        if (Array.isArray(list)) {
          setNotifications(normalizeNotifications(list, cpf));
          return;
        }
      } catch (errMinhas) {
        console.debug(
          'notificacaoService.listMinhas falhou, tentando rota antiga com CPF:',
          String((errMinhas as any)?.response?.status ?? (errMinhas as any)?.message ?? errMinhas)
        );
        try {
          const listByCpf = await notificacaoService.listByCpf(cpf, 1, 100);
          if (Array.isArray(listByCpf)) {
            setNotifications(normalizeNotifications(listByCpf, cpf));
            return;
          }
        } catch (errOld) {
          console.debug(
            'notificacaoService.listByCpf também falhou:',
            String((errOld as any)?.response?.status ?? (errOld as any)?.message ?? errOld)
          );
        }
      }

      const fallbackList = await notificacaoService.list(1, 100);
      if (Array.isArray(fallbackList)) {
        const filtered = fallbackList.filter((item: any) => {
          if (!item) return false;
          if (matchesCpf(item.cpfUsuario, cpf)) return true;
          if (
            Array.isArray(item.destinatarios) &&
            item.destinatarios.some((dest: any) => matchesCpf(dest?.cpf ?? dest?.cpfUsuario, cpf))
          )
            return true;
          if (
            Array.isArray(item.usuarioNotificacoes) &&
            item.usuarioNotificacoes.some((relation: any) =>
              matchesCpf(relation?.cpfUsuario ?? relation?.cpf, cpf)
            )
          )
            return true;
          if (
            Array.isArray(item.UsuarioNotificacoes) &&
            item.UsuarioNotificacoes.some((relation: any) =>
              matchesCpf(relation?.cpfUsuario ?? relation?.cpf, cpf)
            )
          )
            return true;
          return false;
        });

        setNotifications(normalizeNotifications(filtered, cpf));
        return;
      }

      setNotifications([]);
    } catch (err) {
      console.error(err);
      toast.error('Falha ao buscar notificações');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.cpf]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificacaoService.markAsRead(id);
      const cpf = user?.cpf ?? '';
      setNotifications((prev) =>
        prev.map((n) =>
          String(n.id) === String(id)
            ? normalizeNotification(
                {
                  ...n,
                  lida: true,
                  dataLeitura: new Date().toISOString(),
                },
                cpf
              )
            : n
        )
      );
    } catch (err) {
      console.error(err);
      toast.error('Falha ao marcar como lida');
    }
  };

  const toggleExpand = (id: string | number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const relativeTime = (iso?: string | null) => {
    if (!iso) return '';
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'agora';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const filtered = notifications
    .filter(n => !showUnreadOnly || !n.lida)
    .filter(n => typeFilter === 'all' || (n.tipo || 'info') === typeFilter)
    .filter(n => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (n.titulo || n.title || '').toLowerCase().includes(q) || (n.mensagem || n.description || '').toLowerCase().includes(q);
    });

  const groupByDay = (list: any[]) => {
    const groups: Record<string, any[]> = {};
    for (const n of list) {
      const d = n.dataEnvio ? new Date(n.dataEnvio) : null;
      // chave ISO yyyy-mm-dd para ordenação confiável
      const key = d ? d.toISOString().slice(0, 10) : 'sem-data';
      groups[key] = groups[key] || [];
      groups[key].push(n);
    }
    return Object.entries(groups).sort((a, b) => {
      const aTime = a[0] === 'sem-data' ? 0 : new Date(a[0]).getTime();
      const bTime = b[0] === 'sem-data' ? 0 : new Date(b[0]).getTime();
      return bTime - aTime; // mais recente primeiro
    });
  };

  const grouped = groupByDay(filtered);

  const unreadCount = notifications.filter(n => !n.lida).length;
  const readCount = notifications.length - unreadCount;
  // const readPct removed: não exibiremos mais cartão de conclusão

  const typeMeta: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    info: { label: 'Info', color: 'bg-blue-500', icon: <Info className="w-3.5 h-3.5" /> },
    alerta: { label: 'Alerta', color: 'bg-amber-500', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    urgente: { label: 'Urgente', color: 'bg-red-600', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    sistema: { label: 'Sistema', color: 'bg-violet-600', icon: <Bell className="w-3.5 h-3.5" /> },
  };


  return (
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen mt-16">
      <div className="bg-gray-50 overflow-hidden w-full max-w-[1600px] relative">
    <SidebarSection />
  <main className="p-4 sm:p-6 lg:p-10 lg:ml-[300px] xl:ml-[310px] 2xl:ml-[320px]">
      <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">Notificações</h1>
                <p className="text-sm text-gray-500 mt-1">Central de avisos, mensagens e alertas</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowUnreadOnly(p => !p)}
                  className={`h-9 px-4 rounded-md text-xs font-medium inline-flex items-center gap-2 border transition ${showUnreadOnly ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'}`}
                >
                  <Filter className="w-4 h-4" /> {showUnreadOnly ? 'Mostrando não lidas' : 'Todas as notificações'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const unread = notifications.filter(n => !n.lida);
                      await Promise.all(unread.map(n => notificacaoService.markAsRead(String(n.id))));
                      const cpf = user?.cpf ?? '';
                      const nowIso = new Date().toISOString();
                      setNotifications(prev => prev.map(n => unread.some(u => String(u.id) === String(n.id)) ? normalizeNotification({ ...n, lida: true, dataLeitura: nowIso }, cpf) : n));
                      toast.success('Todas marcadas como lidas');
                    } catch (err) {
                      console.error(err);
                      toast.error('Falha ao marcar todas');
                    }
                  }}
                  disabled={notifications.filter(n => !n.lida).length === 0}
                  className="h-9 px-4 rounded-md text-xs font-medium inline-flex items-center gap-2 bg-green-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition"
                >
                  <CheckCircle2 className="w-4 h-4" /> Marcar todas
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white border shadow-sm flex flex-col gap-1">
              <div className="text-xs font-medium text-gray-500 uppercase">Total</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{notifications.length}</span>
                <CircleDot className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm flex flex-col gap-1">
              <div className="text-xs font-medium uppercase opacity-80">Não lidas</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{unreadCount}</span>
                <MailOpen className="w-5 h-5 opacity-90" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border shadow-sm flex flex-col gap-1">
              <div className="text-xs font-medium text-gray-500 uppercase">Lidas</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-emerald-600">{readCount}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {(['all','info','alerta','urgente','sistema'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${typeFilter === t ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'}`}
                  >
                    {t === 'all' ? 'Todos' : typeMeta[t].label}
                  </button>
                ))}
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título ou mensagem..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>
            </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3 max-w-3xl">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-500 text-sm flex items-center gap-2 bg-white rounded-lg border px-4 py-10 max-w-3xl">
              <Bell className="w-5 h-5 text-gray-400" /> Nenhuma notificação encontrada.
            </div>
          ) : (
            <div className="space-y-10 max-w-4xl">
              {grouped.map(([key, items]) => {
                const label = key === 'sem-data'
                  ? 'Sem data'
                  : new Date(key + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    });
                return (
                <div key={key} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold tracking-wide uppercase text-gray-500">{label}</div>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                  </div>
                  <div className="space-y-3">
                    {items.map((n: any) => {
                      const tipo = (n.tipo || 'info') as 'info' | 'alerta' | 'urgente' | 'sistema';
                      const meta = typeMeta[tipo];
                      const isExpanded = expanded[n.id];
                      const message = n.mensagem ?? n.description ?? '';
                      const short = message.length > 180 && !isExpanded ? message.slice(0, 180) + '…' : message;
                      return (
                        <div key={n.id} className={`relative group rounded-xl border shadow-sm overflow-hidden transition bg-white ${!n.lida ? 'ring-1 ring-blue-200' : ''}`}>
                          <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.8), rgba(99,102,241,0.8))' }} />
                          <div className="p-4 sm:p-5 flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow ${meta.color}`}>
                                {meta.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate max-w-[260px] sm:max-w-[400px]">{n.titulo ?? n.title ?? 'Notificação'}</h3>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${n.lida ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>{n.lida ? 'Lida' : 'Não lida'}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">{meta.label}</span>
                                  {n.dataEnvio && (
                                    <span
                                      className="text-[10px] text-gray-400"
                                      title={new Date(n.dataEnvio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                    >
                                      {relativeTime(n.dataEnvio)}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                  {short}
                                </div>
                                {message.length > 180 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(n.id)}
                                    className="mt-1 text-[11px] font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                                  >
                                    {isExpanded ? <>Mostrar menos <ChevronUp className="w-3 h-3" /></> : <>Ler mais <ChevronDown className="w-3 h-3" /></>}
                                  </button>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                {!n.lida && (
                                  <button
                                    onClick={() => markAsRead(String(n.id))}
                                    className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-medium shadow"
                                  >Marcar lida</button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );})}
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsGuardian;

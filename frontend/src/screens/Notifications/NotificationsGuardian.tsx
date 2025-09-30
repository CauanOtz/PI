import { useCallback, useEffect, useState } from 'react';
import { SidebarSection } from '../../components/layout/SidebarSection';
import { useAuth } from '../../context/AuthProvider';
import { notificacaoService } from '../../services/notificacao';
import { toast } from 'sonner';

export const NotificationsGuardian = (): JSX.Element => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const remove = async (id: string) => {
    try {
      await notificacaoService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notificação removida');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao excluir notificação');
    }
  };

  return (
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen mt-16">
      <div className="bg-gray-50 overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <main className="pl-[320px] p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Minhas Notificações</h1>
              <p className="text-sm text-gray-500">Visualize e gerencie suas notificações</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">{notifications.filter(n => !n.lida).length} não lidas</div>
              <button
                onClick={async () => {
                  // marcar todas como lidas localmente + chamar backend por item
                  try {
                    const unread = notifications.filter((n) => !n.lida);
                    await Promise.all(
                      unread.map((n) => notificacaoService.markAsRead(String(n.id)))
                    );
                    const cpf = user?.cpf ?? '';
                    const nowIso = new Date().toISOString();
                    setNotifications((prev) =>
                      prev.map((n) =>
                        unread.some((item) => String(item.id) === String(n.id))
                          ? normalizeNotification(
                              {
                                ...n,
                                lida: true,
                                dataLeitura: nowIso,
                              },
                              cpf
                            )
                          : n
                      )
                    );
                    toast.success('Todas as notificações marcadas como lidas');
                  } catch (err) {
                    console.error(err);
                    toast.error('Falha ao marcar todas como lidas');
                  }
                }}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              >
                Marcar todas como lidas
              </button>
            </div>
          </div>

          {loading ? (
            <div>Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-w-3xl">
              {notifications.length === 0 && (
                <div className="text-gray-500">Nenhuma notificação</div>
              )}
              {notifications.map(n => (
                <div key={n.id} className={`p-4 rounded-lg shadow-sm border ${n.lida ? 'bg-white' : 'bg-blue-50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{n.titulo ?? n.title}</div>
                        <span className="text-xs text-gray-400">{n.dataEnvio ? new Date(n.dataEnvio).toLocaleString() : ''}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{n.mensagem ?? n.description}</div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {!n.lida && <button onClick={() => markAsRead(String(n.id))} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Marcar lida</button>}
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationsGuardian;

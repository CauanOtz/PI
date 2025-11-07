import { useEffect, useState, useMemo } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import {
  FileTextIcon,
  UsersIcon,
  ClipboardCheckIcon,
  CalendarIcon,
  BellIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  EyeIcon,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { NotificationsDropdown } from "../../components/ui/notifications-dropdown";
import { toast } from "sonner";
import { dashboardService } from "../../services/dashboard";
import { notificacaoService } from '../../services/notificacao';
import { useAuth } from "../../context/AuthProvider";

export const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = (user?.role === 'admin');

  const [totalAlunos, setTotalAlunos] = useState<number | null>(null);
  const [presenceAvg] = useState<number | null>(null); // placeholder until backend provides metric
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readStats, setReadStats] = useState<Record<string | number, { lidas: number; total: number }>>({});
  const [readersModalOpen, setReadersModalOpen] = useState(false);
  const [readersLoading, setReadersLoading] = useState(false);
  const [currentReaders, setCurrentReaders] = useState<any[]>([]);
  const [currentNotif, setCurrentNotif] = useState<any | null>(null);

  const stats = [
    {
      title: "Total de Assistidos",
      value: totalAlunos !== null ? String(totalAlunos) : "...",
      change: 0,
      icon: <UsersIcon className="w-4 h-4 text-blue-500" />,
    },
    {
      title: "Média de Presença",
      value: presenceAvg !== null ? `${presenceAvg}%` : "...",
      change: 0,
      icon: <ClipboardCheckIcon className="w-4 h-4 text-green-500" />,
    },
  ];

  const quickAccessCards = [
    {
      title: "Fazer Chamada",
      description: "Registrar presenças e faltas",
      icon: <ClipboardCheckIcon className="w-6 h-6 text-yellow-500" />,
      path: "/attendance",
      bgColor: "bg-yellow-50/70",
    },
    {
      title: "Relatórios",
      description: "Visualizar relatórios e documentos",
      icon: <FileTextIcon className="w-6 h-6 text-pink-500" />,
      path: "/files",
      bgColor: "bg-pink-50/70",
    },
    {
      title: "Assistidos",
      description: "Gerenciar assistidos",
      icon: <UsersIcon className="w-6 h-6 text-purple-500" />,
      path: "/students",
      bgColor: "bg-purple-50/70",
    },
  ];

  // will be driven by backend; keep icons as fallback in render
  // upcomingEvents will come from backend

  const handleReadNotification = (id: string) => {
    if (isAdmin) return; // admin não marca como lida aqui
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    (async () => {
      try {
        await notificacaoService.markAsRead(id);
      } catch (err) {
        console.error('Erro ao marcar notificação como lida', err);
        toast.error('Não foi possível marcar notificação como lida');
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      }
    })();
  };
  const handleDeleteNotification = (id: string) => {
    (async () => {
      try {
        await notificacaoService.delete(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notificação removida");
      } catch (err) {
        console.error('Erro ao remover notificação', err);
        toast.error('Não foi possível remover notificação');
      }
    })();
  };
  // Removido: ação de marcar todas como lidas não desejada agora

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [alunosCount, notifs] = await Promise.all([
          dashboardService.getAlunosCount(),
          dashboardService.getNotifications(),
        ]);
        if (!mounted) return;
        setTotalAlunos(alunosCount ?? 0);
        setNotifications(Array.isArray(notifs) ? notifs : []);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        toast.error("Falha ao carregar dados do dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const recentNotifs = useMemo(() => notifications.slice(0, 6), [notifications]);

  const openReaders = async (notif: any) => {
    if (!isAdmin) return;
    setCurrentNotif(notif);
    setReadersModalOpen(true);
    setReadersLoading(true);
    try {
      const usuarios = await notificacaoService.listUsuariosNotificacao(String(notif.id));
      setCurrentReaders(usuarios);
      const lidas = usuarios.filter((u: any) => u.lida === true || u.UsuarioNotificacao?.lida === true || u.dataLeitura).length;
      setReadStats(s => ({ ...s, [notif.id]: { lidas, total: usuarios.length } }));
    } catch (err) {
      console.error('Falha ao carregar destinatários', err);
      toast.error('Falha ao carregar destinatários');
      setCurrentReaders([]);
    } finally {
      setReadersLoading(false);
    }
  };

  const closeReaders = () => {
    setReadersModalOpen(false);
    setCurrentNotif(null);
    setCurrentReaders([]);
  };

  return (
    <>
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen mt-16">
      <div className="bg-gray-50 overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-2">Bem-vindo ao seu painel de controle</p>
            </div>
            <NotificationsDropdown
              notifications={notifications}
              onReadNotification={handleReadNotification}
              onDeleteNotification={handleDeleteNotification}
            />
          </div>

          {/* Métricas principais */}
          <section aria-label="Métricas" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4 sm:p-6 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  </div>
                  <div className="p-2 rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors">{stat.icon}</div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            ))}
            <Card className="p-4 sm:p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Notificações</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{unreadCount}</h3>
                </div>
                <div className="p-2 rounded-md bg-gray-100"><BellIcon className="w-5 h-5 text-blue-600" /></div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/notificacoes', { state: { focus: 'all' } })}
                className="text-xs mt-4 inline-flex items-center gap-1 text-blue-600 hover:underline"
                aria-label="Ver todas as notificações"
              >Ver todas →</button>
            </Card>
          </section>

          {/* Ações Rápidas */}
            <section aria-label="Ações Rápidas" className="mb-10">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><ShieldCheckIcon className="w-4 h-4 text-blue-600" /> Ações Rápidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {quickAccessCards.map((card, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(card.path)}
                    className={`${card.bgColor} relative p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 sm:p-3 rounded-full bg-white shadow-sm">{card.icon}</div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{card.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-snug line-clamp-2">{card.description}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-lg ring-1 ring-black/5 pointer-events-none" />
                  </button>
                ))}
              </div>
            </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Painel de Últimas Notificações Enviadas */}
            <Card className="p-5 col-span-1 lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><BellIcon className="w-4 h-4 text-blue-600" /> Últimas notificações enviadas</h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/notificacoes', { state: { focus: 'all' } })}
                    className="text-xs text-blue-600 hover:underline"
                  >Ver todas</button>
                </div>
              </div>
              {loading ? (
                <div className="text-sm text-gray-500">Carregando notificações...</div>
              ) : recentNotifs.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhuma notificação.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentNotifs.map((n: any, idx: number) => {
                    const stats = readStats[n.id];
                    const loadingThis = readersLoading && currentNotif?.id === n.id;
                    return (
                      <li key={idx} className="py-3 flex items-start gap-3 group">
                        <div className={`w-2 h-2 rounded-full mt-2 ${n.read ? 'bg-gray-300' : 'bg-blue-500 animate-pulse'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-700 truncate flex items-center gap-2">
                            {n.title ?? n.titulo ?? 'Notificação'}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => openReaders(n)}
                                className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded"
                                title="Ver destinatários e leituras"
                              >
                                <EyeIcon className="w-3 h-3" />{loadingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : (stats ? `${stats.lidas}/${stats.total}` : '—')}
                              </button>
                            )}
                          </p>
                          {n.body || n.mensagem || n.message ? (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body ?? n.mensagem ?? n.message}</p>
                          ) : null}
                          <div className="mt-1 flex items-center gap-3">
                            {!isAdmin && !n.read && (
                              <button
                                type="button"
                                onClick={() => handleReadNotification(n.id)}
                                className="text-[11px] text-blue-600 hover:underline"
                              >Marcar como lida</button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteNotification(n.id)}
                              className="text-[11px] text-rose-600 hover:underline"
                            >Remover</button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Resumo do Sistema */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><BarChart3Icon className="w-4 h-4 text-blue-600" /> Resumo do Sistema</h2>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Assistidos Cadastrados</span>
                    <span className="font-semibold text-gray-900">{totalAlunos ?? '...'}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Notificações (total)</span>
                    <span className="font-semibold text-gray-900">{notifications.length}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Não lidas</span>
                    <span className="font-semibold text-blue-600">{unreadCount}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Presença média</span>
                    <span className="font-semibold text-gray-900">{presenceAvg !== null ? `${presenceAvg}%` : '—'}</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
    {isAdmin && readersModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={closeReaders} />
        <div className="relative bg-white w-full max-w-lg rounded-lg shadow-lg p-5 z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Destinatários da notificação</h3>
              <p className="text-xs text-gray-500 mt-1 truncate">{currentNotif?.title || currentNotif?.titulo}</p>
            </div>
            <button onClick={closeReaders} className="text-gray-500 hover:text-gray-700 text-sm">Fechar</button>
          </div>
          {readersLoading ? (
            <div className="text-sm text-gray-500">Carregando...</div>
          ) : currentReaders.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum destinatário associado.</div>
          ) : (
            <div className="max-h-72 overflow-y-auto border rounded">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 font-medium text-gray-600">Nome</th>
                    <th className="px-3 py-2 font-medium text-gray-600">CPF</th>
                    <th className="px-3 py-2 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReaders.map((u: any, i: number) => {
                    const lida = u.lida === true || u.UsuarioNotificacao?.lida === true || !!u.dataLeitura || !!u.UsuarioNotificacao?.dataLeitura;
                    return (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-1.5 text-gray-700">{u.nome || u.name || '—'}</td>
                        <td className="px-3 py-1.5 text-gray-600 text-xs">{u.cpfUsuario || u.cpf || '—'}</td>
                        <td className="px-3 py-1.5">
                          {lida ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">Lida</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">Não lida</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {currentNotif && (
            <div className="mt-4 text-xs text-gray-500 flex justify-between">
              <span>Total destinatários: {readStats[currentNotif.id]?.total ?? currentReaders.length}</span>
              <span>Lidas: {readStats[currentNotif.id]?.lidas ?? currentReaders.filter((u: any) => u.lida || u.UsuarioNotificacao?.lida || u.dataLeitura).length}</span>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default Dashboard;
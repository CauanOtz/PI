import { useEffect, useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import {
  FileTextIcon,
  UsersIcon,
  ClipboardCheckIcon,
  // BellIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  // EyeIcon,
  // Loader2,
  CalendarIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
// import { NotificationsDropdown } from "../../components/ui/notifications-dropdown";
import { toast } from "sonner";
import { dashboardService } from "../../services/dashboard";
// import { notificacaoService } from '../../services/notificacao';
import { useAuth } from "../../context/AuthProvider";

export const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const isAdmin = (user?.role === 'admin');

  const [totalAssistidos, setTotalAssistidos] = useState<number | null>(null);
  const [totalAtividades, setTotalAtividades] = useState<number | null>(null);
  const [totalDocumentos, setTotalDocumentos] = useState<number | null>(null);
  const [totalPresencas, setTotalPresencas] = useState<number | null>(null);
  // const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // const [readStats, setReadStats] = useState<Record<string | number, { lidas: number; total: number }>>({});
  // const [readersModalOpen, setReadersModalOpen] = useState(false);
  // const [readersLoading, setReadersLoading] = useState(false);
  // const [currentReaders, setCurrentReaders] = useState<any[]>([]);
  // const [currentNotif, setCurrentNotif] = useState<any | null>(null);

  const stats = [
    {
      title: "Total de Assistidos",
      value: totalAssistidos !== null ? String(totalAssistidos) : "...",
      icon: <UsersIcon className="w-4 h-4 text-blue-500" />,
      onClick: () => navigate('/students'),
    },
    {
      title: "Total de Atividades",
      value: totalAtividades !== null ? String(totalAtividades) : "...",
      icon: <CalendarIcon className="w-4 h-4 text-purple-500" />,
      onClick: () => navigate('/activities'),
    },
    {
      title: "Total de Documentos",
      value: totalDocumentos !== null ? String(totalDocumentos) : "...",
      icon: <FileTextIcon className="w-4 h-4 text-pink-500" />,
      onClick: () => navigate('/files'),
    },
    {
      title: "Registros de Presença",
      value: totalPresencas !== null ? String(totalPresencas) : "...",
      icon: <ClipboardCheckIcon className="w-4 h-4 text-green-500" />,
      onClick: () => navigate('/attendance'),
    },
  ];

  const quickAccessCards = [
    {
      title: "Assistidos",
      description: "Gerenciar assistidos",
      icon: <UsersIcon className="w-6 h-6 text-purple-500" />,
      path: "/students",
      bgColor: "bg-purple-50/70",
    },
    {
      title: "Atividade",
      description: "Cadastrar nova atividade",
      icon: <CalendarIcon className="w-6 h-6 text-blue-500" />,
      path: "/activities",
      bgColor: "bg-blue-50/70",
    },
    {
      title: "Fazer Chamada",
      description: "Registrar presenças e faltas",
      icon: <ClipboardCheckIcon className="w-6 h-6 text-yellow-500" />,
      path: "/attendance",
      bgColor: "bg-yellow-50/70",
    },
    {
      title: "Documentos",
      description: "Gerenciar documentos dos assistidos",
      icon: <FileTextIcon className="w-6 h-6 text-pink-500" />,
      path: "/files",
      bgColor: "bg-pink-50/70",
    },
  ];

  // Código de notificações comentado
  // const handleReadNotification = (id: string) => {
  //   if (isAdmin) return;
  //   setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  //   (async () => {
  //     try {
  //       await notificacaoService.markAsRead(id);
  //     } catch (err) {
  //       console.error('Erro ao marcar notificação como lida', err);
  //       toast.error('Não foi possível marcar notificação como lida');
  //       setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
  //     }
  //   })();
  // };
  // const handleDeleteNotification = (id: string) => {
  //   (async () => {
  //     try {
  //       await notificacaoService.delete(id);
  //       setNotifications((prev) => prev.filter((n) => n.id !== id));
  //       toast.success("Notificação removida");
  //     } catch (err) {
  //       console.error('Erro ao remover notificação', err);
  //       toast.error('Não foi possível remover notificação');
  //     }
  //   })();
  // };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [assistidosCount, atividadesCount, documentosCount, presencasCount] = await Promise.all([
          dashboardService.getAssistidosCount(),
          dashboardService.getAtividadesCount(),
          dashboardService.getDocumentosCount(),
          dashboardService.getPresencasCount(),
        ]);
        if (!mounted) return;
        setTotalAssistidos(assistidosCount ?? 0);
        setTotalAtividades(atividadesCount ?? 0);
        setTotalDocumentos(documentosCount ?? 0);
        setTotalPresencas(presencasCount ?? 0);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        toast.error("Falha ao carregar dados do dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Código de notificações comentado
  // const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  // const recentNotifs = useMemo(() => notifications.slice(0, 6), [notifications]);
  // const openReaders = async (notif: any) => {
  //   if (!isAdmin) return;
  //   setCurrentNotif(notif);
  //   setReadersModalOpen(true);
  //   setReadersLoading(true);
  //   try {
  //     const usuarios = await notificacaoService.listUsuariosNotificacao(String(notif.id));
  //     setCurrentReaders(usuarios);
  //     const lidas = usuarios.filter((u: any) => u.lida === true || u.UsuarioNotificacao?.lida === true || u.dataLeitura).length;
  //     setReadStats(s => ({ ...s, [notif.id]: { lidas, total: usuarios.length } }));
  //   } catch (err) {
  //     console.error('Falha ao carregar destinatários', err);
  //     toast.error('Falha ao carregar destinatários');
  //     setCurrentReaders([]);
  //   } finally {
  //     setReadersLoading(false);
  //   }
  // };
  // const closeReaders = () => {
  //   setReadersModalOpen(false);
  //   setCurrentNotif(null);
  //   setCurrentReaders([]);
  // };

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
            {/* <NotificationsDropdown
              notifications={notifications}
              onReadNotification={handleReadNotification}
              onDeleteNotification={handleDeleteNotification}
            /> */}
          </div>

          {/* Métricas principais */}
          <section aria-label="Métricas" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="p-4 sm:p-6 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={stat.onClick}
              >
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
            {/* Card de Notificações comentado */}
            {/* <Card className="p-4 sm:p-6 flex flex-col justify-between">
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
            </Card> */}
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
            {/* Painel de Resumo do Sistema */}
            <Card className="p-5 col-span-1 lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BarChart3Icon className="w-4 h-4 text-blue-600" /> Visão Geral do Sistema
                </h2>
              </div>
              {loading ? (
                <div className="text-sm text-gray-500">Carregando dados...</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Assistidos Cadastrados</p>
                    <p className="text-2xl font-bold text-blue-600">{totalAssistidos ?? 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Atividades Registradas</p>
                    <p className="text-2xl font-bold text-purple-600">{totalAtividades ?? 0}</p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Documentos Armazenados</p>
                    <p className="text-2xl font-bold text-pink-600">{totalDocumentos ?? 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Presenças Registradas</p>
                    <p className="text-2xl font-bold text-green-600">{totalPresencas ?? 0}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Resumo Detalhado */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <BarChart3Icon className="w-4 h-4 text-blue-600" /> Estatísticas
                </h2>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Total de Assistidos</span>
                    <span className="font-semibold text-gray-900">{totalAssistidos ?? 0}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Total de Atividades</span>
                    <span className="font-semibold text-gray-900">{totalAtividades ?? 0}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Total de Documentos</span>
                    <span className="font-semibold text-gray-900">{totalDocumentos ?? 0}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Registros de Presença</span>
                    <span className="font-semibold text-gray-900">{totalPresencas ?? 0}</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Painel de Notificações comentado */}
          {/* <Card className="p-5 col-span-1 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><BellIcon className="w-4 h-4 text-blue-600" /> Últimas notificações enviadas</h2>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate('/notificacoes', { state: { focus: 'all' } })} className="text-xs text-blue-600 hover:underline">Ver todas</button>
              </div>
            </div>
            {loading ? (<div className="text-sm text-gray-500">Carregando notificações...</div>) : recentNotifs.length === 0 ? (<div className="text-sm text-gray-500">Nenhuma notificação.</div>) : (
              <ul className="divide-y divide-gray-100">
                {recentNotifs.map((n: any, idx: number) => {
                  const stats = readStats[n.id];
                  const loadingThis = readersLoading && currentNotif?.id === n.id;
                  return (<li key={idx} className="py-3 flex items-start gap-3 group">...</li>);
                })}
              </ul>
            )}
          </Card> */}
        </div>
      </div>
    </div>
    {/* Modal de leitores de notificações comentado */}
    {/* {isAdmin && readersModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={closeReaders} />
        <div className="relative bg-white w-full max-w-lg rounded-lg shadow-lg p-5 z-10">...</div>
      </div>
    )} */}
    </>
  );
};

export default Dashboard;
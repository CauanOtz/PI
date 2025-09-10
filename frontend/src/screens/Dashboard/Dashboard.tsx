import React, { useEffect, useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import {
  FileTextIcon,
  UsersIcon,
  ClipboardCheckIcon,
  BarChart2Icon,
  CalendarIcon,
  TrendingUpIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { NotificationsDropdown } from "../../components/ui/notifications-dropdown";
import { toast } from "sonner";
import { dashboardService } from "../../services/dashboard";

export const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();

  const [totalAlunos, setTotalAlunos] = useState<number | null>(null);
  const [presenceAvg, setPresenceAvg] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    {
      title: "Total de Alunos",
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
      icon: <ClipboardCheckIcon className="w-6 h-6 text-yellow-400" />,
      path: "/attendance",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Relatórios",
      description: "Visualizar relatórios e documentos",
      icon: <FileTextIcon className="w-6 h-6 text-pink-400" />,
      path: "/files",
      bgColor: "bg-pink-50",
    },
    {
      title: "Alunos e Turmas",
      description: "Gerenciar estudantes e classes",
      icon: <UsersIcon className="w-6 h-6 text-purple-400" />,
      path: "/students",
      bgColor: "bg-purple-50",
    },
    {
      title: "Calendário",
      description: "Ver eventos e cronograma",
      icon: <CalendarIcon className="w-6 h-6 text-blue-400" />,
      path: "/calendar",
      bgColor: "bg-blue-50",
    },
  ];

  // will be driven by backend; keep icons as fallback in render
  // upcomingEvents will come from backend

  const handleReadNotification = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notificação removida");
  };
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Todas as notificações foram marcadas como lidas");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [alunosCount, notifs, activities, events] = await Promise.all([
          dashboardService.getAlunosCount(),
          dashboardService.getNotifications(),
          dashboardService.getRecentActivities(),
          dashboardService.getUpcomingEvents(),
        ]);
        if (!mounted) return;
        setTotalAlunos(alunosCount ?? 0);
        setNotifications(Array.isArray(notifs) ? notifs : []);
        setRecentActivities(Array.isArray(activities) ? activities : []);
        setUpcomingEvents(Array.isArray(events) ? events : []);
        // presenceAvg not implemented in backend: keep null or compute later
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        toast.error("Falha ao carregar dados do dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
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
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">{stat.icon}</div>
                </div>
                <div className="flex items-center mt-4">
                  <TrendingUpIcon className={`w-4 h-4 text-gray-400 mr-1`} />
                  <span className="text-xs sm:text-sm text-gray-500">Dados carregados do backend</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {quickAccessCards.map((card, index) => (
              <button
                key={index}
                onClick={() => navigate(card.path)}
                className={`${card.bgColor} p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left w-full`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 sm:p-3 rounded-full bg-white shadow-sm">{card.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{card.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Atividades Recentes</h2>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-sm text-gray-500">Carregando atividades...</div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-sm text-gray-500">Sem atividades recentes.</div>
                ) : (
                  recentActivities.map((act: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3 min-w-0">
                        <ClipboardCheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 text-sm truncate">{act.description ?? act.title ?? act.nome ?? "Atividade"}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-400 ml-2">{act.time ?? act.createdAt ?? ""}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Próximos Eventos</h2>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-sm text-gray-500">Carregando eventos...</div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-sm text-gray-500">Sem eventos agendados.</div>
                ) : (
                  upcomingEvents.map((ev: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">{ev.title ?? ev.nome ?? "Evento"}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">{ev.date ?? ev.data ?? ""} {ev.time ?? ""}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
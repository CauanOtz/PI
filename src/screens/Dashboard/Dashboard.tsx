import React from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import {
  FileTextIcon,
  UsersIcon,
  ClipboardCheckIcon,
  BarChart2Icon,
  BookOpenIcon,
  CalendarIcon,
  BellIcon,
  TrendingUpIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { NotificationsDropdown } from "../../components/ui/notifications-dropdown";
import { toast } from "sonner";

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: JSX.Element;
}

export const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();

  const stats: StatCard[] = [
    {
      title: "Total de Alunos",
      value: "248",
      change: 12,
      icon: <UsersIcon className="w-4 h-4 text-blue-500" />,
    },
    {
      title: "Média de Presença",
      value: "92%",
      change: 4,
      icon: <ClipboardCheckIcon className="w-4 h-4 text-green-500" />,
    },
    {
      title: "Avaliações Pendentes",
      value: "8",
      change: -2,
      icon: <BarChart2Icon className="w-4 h-4 text-orange-500" />,
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
      title: "Avaliações",
      description: "Gerenciar provas e notas",
      icon: <BarChart2Icon className="w-6 h-6 text-red-400" />,
      path: "/exams",
      bgColor: "bg-red-50",
    },
    {
      title: "Plano de Aula",
      description: "Criar e editar planos de aula",
      icon: <BookOpenIcon className="w-6 h-6 text-green-400" />,
      path: "/lessons",
      bgColor: "bg-green-50",
    },
    {
      title: "Calendário",
      description: "Ver eventos e cronograma",
      icon: <CalendarIcon className="w-6 h-6 text-blue-400" />,
      path: "/calendar",
      bgColor: "bg-blue-50",
    },
  ];

  const recentActivities = [
    {
      icon: <ClipboardCheckIcon className="w-5 h-5 text-green-500" />,
      description: "Chamada realizada - Turma 301",
      time: "Há 2 horas",
      type: "success",
    },
    {
      icon: <BarChart2Icon className="w-5 h-5 text-blue-500" />,
      description: "Notas registradas - Matemática",
      time: "Há 1 dia",
      type: "info",
    },
    {
      icon: <AlertCircleIcon className="w-5 h-5 text-red-500" />,
      description: "Aluno com baixa frequência - João Silva",
      time: "Há 2 dias",
      type: "warning",
    },
  ];

  const upcomingEvents = [
    {
      title: "Reunião de Pais",
      date: "15 Abril",
      time: "19:00",
      type: "meeting",
    },
    {
      title: "Prova de Matemática",
      date: "18 Abril",
      time: "10:00",
      type: "exam",
    },
  ];

  const [notifications, setNotifications] = React.useState([
    {
      id: '1',
      title: 'Nova avaliação registrada',
      description: 'Prova de Matemática foi adicionada ao calendário',
      time: 'Há 5 minutos',
      type: 'info' as const,
      read: false,
    },
    {
      id: '2',
      title: 'Chamada finalizada',
      description: 'Presença registrada para a turma 301',
      time: 'Há 2 horas',
      type: 'success' as const,
      read: false,
    },
    {
      id: '3',
      title: 'Alerta de frequência',
      description: 'João Silva atingiu limite de faltas',
      time: 'Há 1 dia',
      type: 'warning' as const,
      read: true,
    },
  ]);

  const handleReadNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast.success('Notificação removida');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success('Todas as notificações foram marcadas como lidas');
  };

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
                  <TrendingUpIcon className={`w-4 h-4 ${stat.change > 0 ? 'text-green-500' : 'text-red-500'} mr-1`} />
                  <span className={`text-xs sm:text-sm ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stat.change)}% em relação ao mês anterior
                  </span>
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
                  <div className="p-2 sm:p-3 rounded-full bg-white shadow-sm">
                    {card.icon}
                  </div>
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
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3 min-w-0">
                      {activity.icon}
                      <span className="text-gray-600 text-sm truncate">{activity.description}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400 ml-2">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Próximos Eventos</h2>
              <div className="space-y-3 sm:space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">{event.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{event.date} às {event.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
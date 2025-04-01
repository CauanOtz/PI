import React from "react";
import { SidebarSection } from "../Teachers/sections/SidebarSection";
import {
  FileTextIcon,
  UsersIcon,
  ClipboardCheckIcon,
  BarChart2Icon,
  BookOpenIcon,
  CalendarIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();

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
      path: "/billing",
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

  return (
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen">
      <div className="bg-gray-50 overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col ml-[283px] p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-2">Bem-vindo ao seu painel de controle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessCards.map((card, index) => (
              <button
                key={index}
                onClick={() => navigate(card.path)}
                className={`${card.bgColor} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-left`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{card.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Seção de Atividades Recentes */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Atividades Recentes</h2>
            <div className="space-y-4">
              {/* Exemplo de atividades */}
              <div className="flex items-center space-x-3 text-gray-600">
                <ClipboardCheckIcon className="w-5 h-5 text-green-500" />
                <span>Chamada realizada - Turma 301</span>
                <span className="text-sm text-gray-400">Há 2 horas</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <BarChart2Icon className="w-5 h-5 text-blue-500" />
                <span>Notas registradas - Matemática</span>
                <span className="text-sm text-gray-400">Há 1 dia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
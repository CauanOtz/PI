import {
  BarChart2Icon,
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  SettingsIcon,
  SparklesIcon,
  UsersIcon,
  GraduationCapIcon,
  ClipboardCheckIcon,
  CalendarIcon, // Add this import
} from "lucide-react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { Separator } from "../ui/separator";

export const SidebarSection = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: <HomeIcon className="w-4 h-4 text-blue-400" />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <ClipboardCheckIcon className="w-4 h-4 text-yellow-400" />,
      label: "Presença",
      path: "/attendance",
    },
    {
      icon: <GraduationCapIcon className="w-4 h-4 text-purple-400" />,
      label: "Alunos/Turmas",
      path: "/students",
    },
    {
      icon: <CalendarIcon className="w-4 h-4 text-green-400" />, // Add calendar item
      label: "Calendário",
      path: "/calendar",
    },
    {
      icon: <FileTextIcon className="w-4 h-4 text-pink-400" />,
      label: "Relatório",
      path: "/files",
    },
    {
      icon: <BarChart2Icon className="w-4 h-4 text-red-400" />,
      label: "Avaliações",
      path: "/exams",
    },
    
    {
      icon: <SettingsIcon className="w-4 h-4 text-orange-400" />,
      label: "Configurações",
      path: "/settings",
    },
    
  ];

  return (
    <nav className="w-[241px] h-screen fixed left-0 top-0 bg-[#152259] flex flex-col">
      <div className="flex justify-center mt-[26px]">
        <Avatar className="w-[65px] h-[65px]">
          <AvatarImage src="/ellipse-6.png" alt="Logo da escola" />
          <AvatarFallback>ES</AvatarFallback>
        </Avatar>
      </div>

      <div className="mx-[25px] mt-3 rounded-lg py-2.5">
        <div className="flex items-center justify-center gap-4">
          <span className="font-['Kumbh_Sans',Helvetica] font-semibold text-white text-sm">
            Escola
          </span>
        </div>
      </div>

      <Separator className="mt-[30px] bg-white/10" />

      <div className="flex flex-col px-[25px] mt-[15px] gap-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center h-10 px-4 rounded w-full ${
              location.pathname === item.path
                ? "bg-projectsecondary-300"
                : "bg-transparent hover:bg-projectsecondary-300/50"
            }`}
          >
            {item.icon}
            <span className="ml-4 font-['Kumbh_Sans',Helvetica] font-semibold text-white text-sm">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-auto mb-8 mx-[25px]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center h-10 px-4 rounded w-full hover:bg-projectsecondary-300/50"
        >
          <SparklesIcon className="w-4 h-4 text-red-400" />
          <span className="ml-4 font-['Kumbh_Sans',Helvetica] font-semibold text-white text-sm">
            Sair
          </span>
        </button>
      </div>
    </nav>
  );
};
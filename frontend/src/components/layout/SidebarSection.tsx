import {
  FileTextIcon,
  HomeIcon,
  SparklesIcon,
  PersonStanding,
  ClipboardCheckIcon,
  Menu,
  BookMarked ,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Separator } from "../ui/separator";
import { useAuth } from "../../context/AuthProvider";
import { toast } from "sonner";

export const SidebarSection = (): JSX.Element | null => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user, loading } = useAuth();

  // Não renderiza a sidebar enquanto o usuário estiver sendo carregado
  if (loading || !user) return null;

  const navItems = [
    {
      icon: <HomeIcon className="w-4 h-4 text-blue-400" />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <PersonStanding className="w-4 h-4 text-purple-400" />,
      label: "Assistidos",
      path: "/students",
    },
    {
      icon: <BookMarked  className="w-4 h-4 text-indigo-400" />,
      label: "Atividades",
      path: "/activities",
    },
    {
      icon: <ClipboardCheckIcon className="w-4 h-4 text-yellow-400" />,
      label: "Presenças",
      path: "/attendance",
    },
    {
      icon: <FileTextIcon className="w-4 h-4 text-pink-400" />,
      label: "Documentos",
      path: "/files",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300
          lg:translate-x-0 lg:w-[283px] bg-[#152259]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-[280px]
        `}
      >
        <nav className="h-screen flex flex-col p-6">
          <div className="flex justify-center">
            <div className="w-[65px] h-[65px]">
              <img src="/logoAng.png" alt="Logo da ANG" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="mx-[25px] mt-3 rounded-lg py-2.5">
            <div className="flex items-center justify-center gap-4">
              <span className="font-['Kumbh_Sans',Helvetica] font-semibold text-white text-sm">
                Associação Nova Geração
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
              onClick={() => {
                logout();
                setIsOpen(false);
                toast.success("Desconectado com sucesso");
                navigate("/");
              }}
              className="flex items-center h-10 px-4 rounded w-full hover:bg-projectsecondary-300/50"
            >
              <SparklesIcon className="w-4 h-4 text-red-400" />
              <span className="ml-4 font-['Kumbh_Sans',Helvetica] font-semibold text-white text-sm">
                Sair
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};
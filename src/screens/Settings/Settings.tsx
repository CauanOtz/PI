import React from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Bell, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export const Settings = (): JSX.Element => {
  const [notifications, setNotifications] = React.useState(true);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [language, setLanguage] = React.useState('pt-BR');

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col ml-[283px] p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Configurações</h1>
              <p className="text-gray-600 mt-1">Personalize sua experiência</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notificações</Label>
                <p className="text-sm text-gray-500">
                  Receba notificações sobre presença e atividades
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Idioma</Label>
                <p className="text-sm text-gray-500">
                  Selecione o idioma do sistema
                </p>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Salvar Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
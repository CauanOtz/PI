import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { PencilIcon, XIcon } from "lucide-react";
import { usuariosService } from "../../../services/users";
import { toast } from "sonner";

interface User {
  id: number | string;
  nome?: string;
  cpf?: string;
  [k: string]: any;
}

interface EditStudentData {
  id: number;
  nome: string;
  idade?: number;
  endereco?: string;
  contato?: string;
  responsaveisIds?: number[];
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    nome: string;
    idade?: number;
    endereco?: string | null;
    contato?: string | null;
    responsaveis?: User[];
  } | null;
  onSubmit: (data: EditStudentData) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<EditStudentData | null>(null);
  const [selectedResponsaveis, setSelectedResponsaveis] = React.useState<User[]>([]);
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<User[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const searchDebounceRef = React.useRef<number | null>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  React.useEffect(() => {
    if (student) {
      setFormData({
        id: student.id,
        nome: student.nome,
        idade: student.idade,
        endereco: student.endereco ?? "",
        contato: student.contato ?? "",
        responsaveisIds: student.responsaveis?.map(r => Number(r.id)) ?? [],
      });
      setSelectedResponsaveis(student.responsaveis ?? []);
    } else {
      setFormData(null);
      setSelectedResponsaveis([]);
    }
  }, [student]);

  React.useEffect(() => {
    if (!isSuggestionsOpen) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = window.setTimeout(async () => {
      try {
        const params = { q: query, limit: 10, role: 'responsavel' };
        const res = await usuariosService.list(params);
        const users = (res && (res as any).usuarios) ? (res as any).usuarios : [];
        setSuggestions(Array.isArray(users) ? users.filter(u => !selectedResponsaveis.find(r => r.id === u.id)) : []);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, [query, isSuggestionsOpen, selectedResponsaveis]);

  React.useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!containerRef.current?.contains(ev.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResponsaveis.length === 0) {
      toast.error("Selecione ao menos um responsável.");
      return;
    }
    onSubmit({
      ...formData,
      idade: formData.idade ? Number(formData.idade) : undefined,
      responsaveisIds: selectedResponsaveis.map(r => Number(r.id)),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilIcon className="w-5 h-5 text-blue-600" />
            Editar Aluno
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              placeholder="Digite o nome do aluno"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev!, nome: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idade">Idade</Label>
            <Input
              id="idade"
              type="number"
              placeholder="Ex: 10"
              value={formData.idade ?? ""}
              onChange={(e) => setFormData(prev => ({ ...prev!, idade: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              placeholder="Rua, número, bairro"
              value={formData.endereco ?? ""}
              onChange={(e) => setFormData(prev => ({ ...prev!, endereco: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contato">Contato</Label>
            <Input
              id="contato"
              placeholder="(11) 9xxxx-xxxx"
              value={formData.contato ?? ""}
              onChange={(e) => setFormData(prev => ({ ...prev!, contato: formatPhone(e.target.value) }))}
            />
          </div>

          <div className="space-y-2" ref={containerRef}>
            <Label htmlFor="userSearch">Responsáveis</Label>
            <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[40px]">
              {selectedResponsaveis.map(user => (
                <div key={user.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1 text-sm">
                  <span>{user.nome}</span>
                  <button 
                    type="button"
                    onClick={() => setSelectedResponsaveis(prev => prev.filter(r => r.id !== user.id))}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="relative flex-1">
                <Input
                  id="userSearch"
                  placeholder="Pesquisar responsável..."
                  value={query}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full min-w-[150px] border-none focus:ring-0 focus:outline-none bg-transparent"
                  autoComplete="off"
                />
                {isSuggestionsOpen && (suggestions.length > 0 || loadingSuggestions) && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                    {loadingSuggestions ? (
                      <div className="p-3 text-center text-sm text-gray-500">Buscando...</div>
                    ) : suggestions.map((u) => (
                      <button
                        key={String(u.id)}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setSelectedResponsaveis(prev => [...prev, u]);
                          setQuery("");
                          setIsSuggestionsOpen(false);
                        }}
                      >
                        <div className="font-medium truncate">{u.nome}</div>
                        <div className="text-xs text-gray-500">{u.cpf ? `CPF: ${u.cpf}` : `ID: ${u.id}`}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
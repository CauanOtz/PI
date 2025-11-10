import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { studentsService } from '../../../services/students';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  category: string;
  alunoId: string | number;
}

interface Student {
  id: number | string;
  nome?: string;
  matricula?: string;
  [k: string]: any;
}

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditReportData) => void;
  report: Report | null;
}

export interface EditReportData {
  name: string;
  category: string;
  alunoId?: string | number;
}

export const EditReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  report,
}: EditReportModalProps) => {
  const [formData, setFormData] = React.useState<EditReportData>({
    name: "",
    category: "",
    alunoId: "",
  });

  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Student[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Student | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const searchDebounceRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (isOpen && report) {
      setFormData({
        name: report.name,
        category: report.category,
        alunoId: report.alunoId,
      });
      (async () => {
        try {
          const s = await studentsService.get(Number(report.alunoId));
          if (!mounted) return;
          if (s) {
            setSelected(s);
          }
        } catch (e) {
          // ignora
        }
      })();
    }
    if (!isOpen) {
      setFormData({ name: "", category: "Desempenho", alunoId: "" });
      setQuery("");
      setSuggestions([]);
      setSelected(null);
      setIsSuggestionsOpen(false);
    }
    return () => { mounted = false; };
  }, [isOpen, report]);

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
        const params = query ? { search: query, limit: 10 } : { limit: 10 };
        const res = await studentsService.list(params);
        const alunos = (res && (res as any).alunos) ? (res as any).alunos : [];
        setSuggestions(Array.isArray(alunos) ? alunos : []);
      } catch (err) {
        console.error("Erro ao buscar alunos:", err);
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
  }, [query, isSuggestionsOpen]);

  React.useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(ev.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.alunoId && !selected) {
      toast.error("Selecione o aluno (campo obrigatório).");
      return;
    }
    const payload = { ...formData, alunoId: String(formData.alunoId ?? selected?.id) };
    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative" ref={containerRef}>
            <Label htmlFor="alunoSearch">Aluno</Label>
            <Input
              id="alunoSearch"
              placeholder={selected ? `${selected.nome ?? selected.matricula ?? `#${selected.id}`}` : "Pesquisar aluno por nome / matrícula / id"}
              value={query}
              onFocus={() => setIsSuggestionsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isSuggestionsOpen) {
                  setIsSuggestionsOpen(true);
                }
                if (selected) {
                  setSelected(null);
                  setFormData(prev => ({ ...prev, alunoId: "" }));
                }
              }}
              className="w-full"
              aria-autocomplete="list"
              autoComplete="off"
            />

            { isSuggestionsOpen && (suggestions.length > 0 || loadingSuggestions) && !selected && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-md z-50 max-h-52 overflow-auto">
                {loadingSuggestions ? (
                  <div className="p-3 text-center text-sm text-gray-500">Buscando...</div>
                ) : suggestions.map((s) => (
                  <button
                    key={String(s.id)}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => {
                      setSelected(s);
                      setFormData(prev => ({ ...prev, alunoId: String(s.id) }));
                      setQuery("");
                      setSuggestions([]);
                      setIsSuggestionsOpen(false);
                    }}
                  >
                    <div className="font-medium truncate">{s.nome ?? `#${s.id}`}</div>
                    <div className="text-xs text-gray-500">{s.matricula ? `Matrícula: ${s.matricula}` : `ID: ${s.id}`}</div>
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-md bg-gray-50 border text-sm mt-2">
                <div className="truncate">
                  <div className="font-medium">{selected.nome ?? `#${selected.id}`}</div>
                  <div className="text-xs text-gray-500">{selected.matricula ?? `ID: ${selected.id}`}</div>
                </div>
                <button
                  type="button"
                  className="text-xs text-red-600 px-2 py-1"
                  onClick={() => {
                    setSelected(null);
                    setFormData(prev => ({ ...prev, alunoId: "" }));
                  }}
                >
                  Remover
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Documento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do documento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              className="w-full border rounded-md px-3 py-2"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              <option value="Desempenho">Desempenho</option>
              <option value="Frequência">Frequência</option>
              <option value="Planos">Planos</option>
              <option value="Outros">Outros</option>
            </select>
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
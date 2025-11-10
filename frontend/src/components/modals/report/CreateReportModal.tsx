import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label} from "../../ui/label";
import { FileTextIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { studentsService } from "../../../services/students";

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportFormData) => Promise<void> | void;
  initialAssistidoId?: string | number;
}

interface ReportFormData {
  name: string;
  tipo: string;
  file: File | null;
  assistidoId?: string | number;
}

interface Student {
  id: number | string;
  nome?: string;
  matricula?: string;
  [k: string]: any;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialAssistidoId
}) => {
  const [formData, setFormData] = React.useState<ReportFormData>({
    name: "",
    tipo: "OUTRO",
    file: null,
    assistidoId: ""
  });

  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Student[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Student | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const searchDebounceRef = React.useRef<number | null>(null);

  const tiposDocumento = [
    { value: "RG", label: "RG" },
    { value: "CPF", label: "CPF" },
    { value: "CERTIDAO_NASCIMENTO", label: "Certidão de Nascimento" },
    { value: "COMPROVANTE_ENDERECO", label: "Comprovante de Endereço" },
    { value: "OUTRO", label: "Outro" }
  ];

  React.useEffect(() => {
    let mounted = true;
    if (isOpen && initialAssistidoId) {
      (async () => {
        try {
          const s = await studentsService.get(Number(initialAssistidoId));
          if (!mounted) return;
          if (s) {
            setSelected(s);
            setFormData(prev => ({ ...prev, assistidoId: String(s.id) }));
          }
        } catch (e) {
          // ignora
        }
      })();
    }
    if (!isOpen) {
      setFormData({ name: "", tipo: "OUTRO", file: null, assistidoId: "" });
      setQuery("");
      setSuggestions([]);
      setSelected(null);
    }
    return () => { mounted = false; };
  }, [isOpen, initialAssistidoId]);

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
        const assistidos = (res && (res as any).assistidos) ? (res as any).assistidos : [];
        setSuggestions(Array.isArray(assistidos) ? assistidos : []);
      } catch (err) {
        console.error("Erro ao buscar assistidos:", err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.assistidoId && !selected) {
        toast.error("Selecione o assistido (campo obrigatório).");
        return;
      }

      if (formData.file && formData.file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. O tamanho máximo permitido é 10MB.");
        return;
      }

      const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
      const fileExtension = formData.file?.name.toLowerCase().slice((formData.file?.name.lastIndexOf(".") || 0));
      if (formData.file && !allowedTypes.includes(fileExtension || '')) {
        toast.error("Tipo de arquivo não suportado. Use PDF, DOC, DOCX, XLS ou XLSX.");
        return;
      }

      const payload = { ...formData, assistidoId: String(formData.assistidoId ?? selected?.id) };
      await onSubmit(payload);
      onClose();
      setFormData({ name: "", tipo: "OUTRO", file: null, assistidoId: "" });
      setQuery("");
      setSuggestions([]);
      setSelected(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao criar documento. Tente novamente."
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileTextIcon className="w-5 h-5 text-blue-600" />
            Novo Documento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2 relative" ref={containerRef}>
            <Label htmlFor="assistidoSearch">Assistido</Label>
            <Input
              id="assistidoSearch"
              placeholder={selected ? `${selected.nome ?? selected.matricula ?? `#${selected.id}`}` : "Pesquisar assistido por nome / matrícula / id"}
              value={query}
              onFocus={() => setIsSuggestionsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isSuggestionsOpen) {
                  setIsSuggestionsOpen(true);
                }
                if (selected) {
                  setSelected(null);
                  setFormData(prev => ({ ...prev, assistidoId: "" }));
                }
              }}
              className="w-full"
              aria-autocomplete="list"
              autoComplete="off"
            />

            {isSuggestionsOpen && (suggestions.length > 0 || loadingSuggestions) && !selected && (
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
                      setFormData(prev => ({ ...prev, assistidoId: String(s.id) }));
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
                    setFormData(prev => ({ ...prev, assistidoId: "" }));
                  }}
                >
                  Remover
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do documento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Documento de Desempenho - 1º Bimestre"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Documento</Label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              {tiposDocumento.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                id="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                required
              />
              <label
                htmlFor="file"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <UploadIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formData.file
                    ? formData.file.name
                    : "Clique para fazer upload ou arraste o arquivo"}
                </span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Criar Documento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
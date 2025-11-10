import React from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  FileTextIcon, 
  // FolderIcon removed (unused)
  SearchIcon, 
  DownloadIcon,
  PlusIcon,
  MoreVerticalIcon,
  Pencil,
  Trash2,
  XIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { CreateReportModal, EditReportModal, ViewReportModal } from "../../components/modals/report";
import { DeleteConfirmationModal } from "../../components/modals/shared/DeleteConfirmationModal";
import { toast } from "sonner";
import { documentService } from "../../services/documentService";
import { studentsService } from "../../services/students";

interface Report {
  id: string | number;
  name: string;
  type?: string;
  date?: string;
  size?: string;
  category?: string;
  descricao?: string;
}

interface Student {
  id: number | string;
  nome?: string;
  matricula?: string;
  [k: string]: any;
}

export const Files = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todos");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [reportToEdit, setReportToEdit] = React.useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = React.useState<Report | null>(null);
  const [reportToView, setReportToView] = React.useState<Report | null>(null);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [currentAssistidoId, setCurrentAssistidoId] = React.useState<string>(""); // usuario seleciona o assistido para gerenciar documentos

  const [assistidoSearchQuery, setAssistidoSearchQuery] = React.useState("");
  const [assistidoSuggestions, setAssistidoSuggestions] = React.useState<Student[]>([]);
  const [loadingAssistidoSuggestions, setLoadingAssistidoSuggestions] = React.useState(false);
  const [isAssistidoSuggestionsOpen, setIsAssistidoSuggestionsOpen] = React.useState(false);
  const [selectedAssistido, setSelectedAssistido] = React.useState<Student | null>(null);
  const assistidoContainerRef = React.useRef<HTMLDivElement | null>(null);
  const assistidoSearchDebounceRef = React.useRef<number | null>(null);

  const categories = [
    "Todos",
    "RG",
    "CPF",
    "Certidão de Nascimento",
    "Comprovante de Endereço",
    "Outro"
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  React.useEffect(() => {
    if (!isAssistidoSuggestionsOpen) {
      setAssistidoSuggestions([]);
      return;
    }
    setLoadingAssistidoSuggestions(true);
    if (assistidoSearchDebounceRef.current) {
      window.clearTimeout(assistidoSearchDebounceRef.current);
    }
    assistidoSearchDebounceRef.current = window.setTimeout(async () => {
      try {
        const params = assistidoSearchQuery ? { search: assistidoSearchQuery, limit: 10 } : { limit: 10 };
        const res = await studentsService.list(params);
        const assistidos = (res && (res as any).assistidos) ? (res as any).assistidos : [];
        setAssistidoSuggestions(Array.isArray(assistidos) ? assistidos : []);
      } catch (err) {
        console.error("Erro ao buscar assistidos:", err);
        setAssistidoSuggestions([]);
      } finally {
        setLoadingAssistidoSuggestions(false);
      }
    }, 300);
    return () => {
      if (assistidoSearchDebounceRef.current) {
        window.clearTimeout(assistidoSearchDebounceRef.current);
      }
    };
  }, [assistidoSearchQuery, isAssistidoSuggestionsOpen]);

  React.useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!assistidoContainerRef.current) return;
      if (!assistidoContainerRef.current.contains(ev.target as Node)) {
        setIsAssistidoSuggestionsOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const loadDocuments = async (assistidoId?: string) => {
    const id = assistidoId ?? currentAssistidoId;
    if (!id) {
      toast.error("Informe o ID do assistido para carregar documentos");
      return;
    }
    try {
      setLoading(true);
      const docs = await documentService.listDocuments(id);
      
      // Mapear tipos do backend para labels amigáveis
      const tipoLabels: Record<string, string> = {
        'RG': 'RG',
        'CPF': 'CPF',
        'CERTIDAO_NASCIMENTO': 'Certidão de Nascimento',
        'COMPROVANTE_ENDERECO': 'Comprovante de Endereço',
        'OUTRO': 'Outro'
      };
      
      const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({
        id: String(d.id),
        name: d.nome,
        type: d.tipo ?? "PDF",
        date: d.data_upload ?? d.dataUpload ?? d.createdAt,
        size: d.tamanho ?? d.size,
        category: tipoLabels[d.tipo] ?? d.tipo ?? "Outro",
        descricao: d.descricao
      }));
      setReports(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = (data: any) => {
    (async () => {
      try {
        // data: { name, tipo, file, assistidoId }
        if (!data.assistidoId) {
          toast.error("Informe o ID do assistido no formulário do documento.");
          return;
        }
        await documentService.uploadDocument(data.assistidoId, data.file, { tipo: data.tipo, descricao: data.name });
        toast.success("Documento criado com sucesso!");
        setIsCreateModalOpen(false);
        await loadDocuments(data.assistidoId);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.response?.data?.mensagem || "Erro ao criar documento");
      }
    })();
  };

  const handleEdit = (report: Report) => {
    setReportToEdit(report);
  };

  const handleDelete = (report: Report) => {
    setReportToDelete(report);
  };

  const handleEditSubmit = (data: any) => {
    (async () => {
      if (!reportToEdit) return;
      try {
        if (!currentAssistidoId) {
          toast.error("Assistido não selecionado");
          return;
        }
        await documentService.updateDocument(currentAssistidoId, reportToEdit.id, { nome: data.name, descricao: data.category });
        toast.success("Documento atualizado com sucesso!");
        setReportToEdit(null);
        await loadDocuments();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar documento");
      }
    })();
  };

  const handleDeleteConfirm = () => {
    (async () => {
      if (!reportToDelete) return;
      try {
        if (!currentAssistidoId) {
          toast.error("Assistido não selecionado");
          return;
        }
        await documentService.deleteDocument(currentAssistidoId, reportToDelete.id);
        toast.success("Documento excluído com sucesso!");
        setReportToDelete(null);
        await loadDocuments();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao excluir documento");
      }
    })();
  };

  const handleDownload = async (r: Report) => {
    try {
      if (!currentAssistidoId) {
        toast.error("Assistido não selecionado para download");
        return;
      }
      const blob = await documentService.downloadDocument(currentAssistidoId, r.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.name || "documento";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao baixar arquivo");
    }
  };

  return (
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen mt-16">
      <div className="bg-gray-50 overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
  <div className="flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 lg:ml-[283px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Documentos</h1>
              <p className="text-gray-600 mt-1">Gerencie os documentos dos assistidos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center w-full sm:w-auto" ref={assistidoContainerRef}>
                <Input
                  id="assistidoIdInput"
                  placeholder="Pesquisar assistido..."
                  value={selectedAssistido ? (selectedAssistido.nome ?? `#${selectedAssistido.id}`) : assistidoSearchQuery}
                  readOnly={!!selectedAssistido}
                  onFocus={() => !selectedAssistido && setIsAssistidoSuggestionsOpen(true)}
                  onChange={(e) => setAssistidoSearchQuery(e.target.value)}
                  className="w-full sm:w-52 pr-8"
                  autoComplete="off"
                />
                {selectedAssistido && (
                  <button
                    onClick={() => {
                      setSelectedAssistido(null);
                      setCurrentAssistidoId("");
                      setAssistidoSearchQuery("");
                      setReports([]);
                    }}
                    className="absolute right-2 p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                    aria-label="Limpar seleção"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
                {isAssistidoSuggestionsOpen && (assistidoSuggestions.length > 0 || loadingAssistidoSuggestions) && !selectedAssistido && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                    {loadingAssistidoSuggestions ? (
                      <div className="p-3 text-center text-sm text-gray-500">Buscando...</div>
                    ) : assistidoSuggestions.map((s) => (
                      <button
                        key={String(s.id)}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setSelectedAssistido(s);
                          setCurrentAssistidoId(String(s.id));
                          setAssistidoSearchQuery("");
                          setIsAssistidoSuggestionsOpen(false);
                          loadDocuments(String(s.id));
                        }}
                      >
                        <div className="font-medium truncate">{s.nome ?? `#${s.id}`}</div>
                        <div className="text-xs text-gray-500">{s.matricula ? `Matrícula: ${s.matricula}` : `ID: ${s.id}`}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm flex items-center justify-center"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Novo Documento
              </Button>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar documentos..."
                  className="pl-10 w-full text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md px-3 py-2 bg-white w-full sm:w-auto text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="text-center text-gray-700">Carregando documentos...</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {!selectedAssistido ? (
                <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <UsersIcon className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">Nenhum assistido selecionado</h3>
                    <p className="mt-1 text-sm">
                      Use a barra de pesquisa acima para encontrar um assistido e ver seus documentos.
                    </p>
                  </div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500">Nenhum documento encontrado para o assistido {selectedAssistido?.nome ?? currentAssistidoId}.</div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
                    onClick={() => setReportToView(report)}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-md">
                            <FileTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-800 leading-tight truncate max-w-[12rem] sm:max-w-[18rem]">{report.name}</h3>
                            <p className="text-xs text-gray-500">{report.category}</p>
                          </div>
                        </div>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-gray-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <MoreVerticalIcon className="w-5 h-5" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content 
                              className="min-w-[180px] bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50"
                              align="end" sideOffset={5}
                            >
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer focus:bg-gray-50 focus:outline-none"
                                onClick={(e) => { e.stopPropagation(); handleEdit(report); }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer focus:bg-red-50 focus:outline-none"
                                onClick={(e) => { e.stopPropagation(); handleDelete(report); }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                      <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-xs text-gray-500">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {report.date ? new Date(report.date).toLocaleDateString() : ""}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2 w-full sm:w-auto mt-2 sm:mt-0"
                        onClick={(e) => { e.stopPropagation(); handleDownload(report); }}
                      >
                        <DownloadIcon className="w-4 h-4 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReport}
        initialAssistidoId={currentAssistidoId}
      />
      <EditReportModal
        isOpen={!!reportToEdit}
        onClose={() => setReportToEdit(null)}
        onSubmit={handleEditSubmit}
        report={reportToEdit as any}
      />
      <ViewReportModal
        isOpen={!!reportToView}
        onClose={() => setReportToView(null)}
        report={reportToView}
        onDownload={async (r) => {
          await handleDownload(r);
        }}
      />
      <DeleteConfirmationModal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Documento"
        description={`Tem certeza que deseja excluir o documento "${reportToDelete?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};
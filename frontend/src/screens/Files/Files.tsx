import React from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  FileTextIcon, 
  FolderIcon, 
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
import { CreateReportModal } from "../../components/modals/report/CreateReportModal";
import { EditReportModal } from "../../components/modals/report/EditReportModal";
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
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [currentAlunoId, setCurrentAlunoId] = React.useState<string>(""); // usuario seleciona o aluno para gerenciar documentos

  const [studentSearchQuery, setStudentSearchQuery] = React.useState("");
  const [studentSuggestions, setStudentSuggestions] = React.useState<Student[]>([]);
  const [loadingStudentSuggestions, setLoadingStudentSuggestions] = React.useState(false);
  const [isStudentSuggestionsOpen, setIsStudentSuggestionsOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const studentContainerRef = React.useRef<HTMLDivElement | null>(null);
  const studentSearchDebounceRef = React.useRef<number | null>(null);

  const categories = ["Todos", "Desempenho", "Frequência", "Planos", "Outros"];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  React.useEffect(() => {
    if (!isStudentSuggestionsOpen) {
      setStudentSuggestions([]);
      return;
    }
    setLoadingStudentSuggestions(true);
    if (studentSearchDebounceRef.current) {
      window.clearTimeout(studentSearchDebounceRef.current);
    }
    studentSearchDebounceRef.current = window.setTimeout(async () => {
      try {
        const params = studentSearchQuery ? { search: studentSearchQuery, limit: 10 } : { limit: 10 };
        const res = await studentsService.list(params);
        const alunos = (res && (res as any).alunos) ? (res as any).alunos : [];
        setStudentSuggestions(Array.isArray(alunos) ? alunos : []);
      } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        setStudentSuggestions([]);
      } finally {
        setLoadingStudentSuggestions(false);
      }
    }, 300);
    return () => {
      if (studentSearchDebounceRef.current) {
        window.clearTimeout(studentSearchDebounceRef.current);
      }
    };
  }, [studentSearchQuery, isStudentSuggestionsOpen]);

  React.useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!studentContainerRef.current) return;
      if (!studentContainerRef.current.contains(ev.target as Node)) {
        setIsStudentSuggestionsOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const loadDocuments = async (alunoId?: string) => {
    const id = alunoId ?? currentAlunoId;
    if (!id) {
      toast.error("Informe o ID do aluno para carregar documentos");
      return;
    }
    try {
      setLoading(true);
      const docs = await documentService.listDocuments(id);
      const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({
        id: String(d.id),
        name: d.nome,
        type: d.tipo ?? d.tipoArquivo ?? "PDF",
        date: d.data_upload ?? d.dataUpload ?? d.createdAt,
        size: d.tamanho ?? d.size,
        category: d.categoria ?? "Outros",
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
        // data: { name, category, file, alunoId }
        if (!data.alunoId) {
          toast.error("Informe o ID do aluno no formulário do relatório.");
          return;
        }
        await documentService.uploadDocument(data.alunoId, data.file, data.name, { categoria: data.category });
        toast.success("Relatório criado com sucesso!");
        setIsCreateModalOpen(false);
        await loadDocuments(data.alunoId);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.response?.data?.mensagem || "Erro ao criar relatório");
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
        if (!currentAlunoId) {
          toast.error("Aluno não selecionado");
          return;
        }
        await documentService.updateDocument(currentAlunoId, reportToEdit.id, { nome: data.name, descricao: data.category });
        toast.success("Relatório atualizado com sucesso!");
        setReportToEdit(null);
        await loadDocuments();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar relatório");
      }
    })();
  };

  const handleDeleteConfirm = () => {
    (async () => {
      if (!reportToDelete) return;
      try {
        if (!currentAlunoId) {
          toast.error("Aluno não selecionado");
          return;
        }
        await documentService.deleteDocument(currentAlunoId, reportToDelete.id);
        toast.success("Relatório excluído com sucesso!");
        setReportToDelete(null);
        await loadDocuments();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao excluir relatório");
      }
    })();
  };

  const handleDownload = async (r: Report) => {
    try {
      if (!currentAlunoId) {
        toast.error("Aluno não selecionado para download");
        return;
      }
      const blob = await documentService.downloadDocument(currentAlunoId, r.id);
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
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Relatórios</h1>
              <p className="text-gray-600 mt-1">Gerencie seus documentos e relatórios</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center" ref={studentContainerRef}>
                <Input
                  id="alunoIdInput"
                  placeholder="Pesquisar aluno..."
                  value={selectedStudent ? (selectedStudent.nome ?? `#${selectedStudent.id}`) : studentSearchQuery}
                  readOnly={!!selectedStudent}
                  onFocus={() => !selectedStudent && setIsStudentSuggestionsOpen(true)}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-52 pr-8" 
                  autoComplete="off"
                />
                {selectedStudent && (
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setCurrentAlunoId("");
                      setStudentSearchQuery("");
                      setReports([]);
                    }}
                    className="absolute right-2 p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                    aria-label="Limpar seleção"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
                {isStudentSuggestionsOpen && (studentSuggestions.length > 0 || loadingStudentSuggestions) && !selectedStudent && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                    {loadingStudentSuggestions ? (
                      <div className="p-3 text-center text-sm text-gray-500">Buscando...</div>
                    ) : studentSuggestions.map((s) => (
                      <button
                        key={String(s.id)}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setSelectedStudent(s);
                          setCurrentAlunoId(String(s.id));
                          setStudentSearchQuery("");
                          setIsStudentSuggestionsOpen(false);
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
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Novo Relatório
              </Button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar relatórios..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md px-4 py-2 bg-white w-full sm:w-auto"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {!selectedStudent ? (
                <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <UsersIcon className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">Nenhum aluno selecionado</h3>
                    <p className="mt-1 text-sm">
                      Use a barra de pesquisa acima para encontrar um aluno e ver seus documentos.
                    </p>
                  </div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500">Nenhum documento encontrado para o aluno {selectedStudent?.nome ?? currentAlunoId}.</div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileTextIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 leading-tight truncate">{report.name}</h3>
                            <p className="text-xs text-gray-500">{report.category}</p>
                          </div>
                        </div>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                                onClick={() => handleEdit(report)}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                              <DropdownMenu.Item 
                                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer focus:bg-red-50 focus:outline-none"
                                onClick={() => handleDelete(report)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                      <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {report.date ? new Date(report.date).toLocaleDateString() : ""}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                        onClick={() => handleDownload(report)}
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
        initialAlunoId={currentAlunoId}
      />
      <EditReportModal
        isOpen={!!reportToEdit}
        onClose={() => setReportToEdit(null)}
        onSubmit={handleEditSubmit}
        report={reportToEdit as any}
      />
      <DeleteConfirmationModal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Relatório"
        description={`Tem certeza que deseja excluir o relatório "${reportToDelete?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};
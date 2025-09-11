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
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { CreateReportModal } from "../../components/modals/report/CreateReportModal";
import { EditReportModal } from "../../components/modals/report/EditReportModal";
import { DeleteConfirmationModal } from "../../components/modals/shared/DeleteConfirmationModal";
import { toast } from "sonner";
import { documentService } from "../../services/documentService";

interface Report {
  id: string | number;
  name: string;
  type?: string;
  date?: string;
  size?: string;
  category?: string;
  descricao?: string;
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

  const categories = ["Todos", "Desempenho", "Frequência", "Planos", "Outros"];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              <Input
                id="alunoIdInput"
                placeholder="ID do aluno"
                value={currentAlunoId}
                onChange={(e) => setCurrentAlunoId(e.target.value)}
                className="w-40"
              />
              <Button onClick={() => loadDocuments()} size="sm" className="bg-white border text-dark">Carregar</Button>
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
              {currentAlunoId.trim() === "" ? (
                <div className="col-span-full text-center py-10 text-gray-600">
                  <div className="max-w-md mx-auto">
                    <p className="mb-3">
                      Informe o ID do aluno no campo acima e clique em <strong>Carregar</strong> para ver os documentos associados.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        className="bg-white border text-dark"
                        onClick={() => {
                          const el = document.getElementById("alunoIdInput") as HTMLInputElement | null;
                          el?.focus();
                        }}
                      >
                        Inserir ID do aluno
                      </Button>
                      <Button onClick={() => loadDocuments()} size="sm" className="bg-white border text-dark">Carregar</Button>
                    </div>
                  </div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500">Nenhum documento encontrado para o aluno {currentAlunoId}.</div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                          <FileTextIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">{report.name}</h3>
                          <div className="flex items-center space-x-2 mt-2 flex-wrap">
                            <span className="text-sm text-gray-500">{report.type}</span>
                            <span className="text-sm text-gray-400 hidden sm:inline">•</span>
                            <span className="text-sm text-gray-500">{report.size}</span>
                          </div>
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                            {report.category}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0">
                            <MoreVerticalIcon className="w-5 h-5" />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content 
                            className="min-w-[180px] bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50"
                            align="end"
                            sideOffset={5}
                            avoidCollisions
                          >
                            <DropdownMenu.Item 
                              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleEdit(report)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar Relatório
                            </DropdownMenu.Item>
                            
                            <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                            
                            <DropdownMenu.Item 
                              className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                              onClick={() => handleDelete(report)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir Relatório
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 pt-4 border-t">
                      <span className="text-sm text-gray-500">
                        {report.date ? new Date(report.date).toLocaleDateString() : ""}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 w-full sm:w-auto justify-center"
                          onClick={() => handleDownload(report)}
                        >
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
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
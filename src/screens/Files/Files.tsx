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
import { CreateReportModal } from "../../components/modals/CreateReportModal";
import { EditReportModal } from "../../components/modals/EditReportModal";
import { DeleteConfirmationModal } from "../../components/modals/DeleteConfirmationModal";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  category: string;
}

const mockReports: Report[] = [
  {
    id: "1",
    name: "Relatório de Desempenho - 1º Bimestre",
    type: "PDF",
    date: "2024-03-15",
    size: "2.4 MB",
    category: "Desempenho"
  },
  {
    id: "2",
    name: "Relatório de Frequência - Março",
    type: "PDF",
    date: "2024-03-31",
    size: "1.8 MB",
    category: "Frequência"
  },
  {
    id: "3",
    name: "Plano de Aula - Matemática",
    type: "DOCX",
    date: "2024-03-28",
    size: "856 KB",
    category: "Planos"
  },
  // Add more mock data as needed
];

export const Files = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todos");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [reportToEdit, setReportToEdit] = React.useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = React.useState<Report | null>(null);
  const [reports, setReports] = React.useState<Report[]>(mockReports);

  const categories = ["Todos", "Desempenho", "Frequência", "Planos", "Outros"];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateReport = (data: any) => {
    console.log("New report data:", data);
    // Here you would typically handle the file upload and creation
  };

  const handleEdit = (report: Report) => {
    setReportToEdit(report);
  };

  const handleDelete = (report: Report) => {
    setReportToDelete(report);
  };

  const handleEditSubmit = (data: any) => {
    if (reportToEdit) {
      setReports(prev => prev.map(report => 
        report.id === reportToEdit.id
          ? { ...report, ...data }
          : report
      ));
      toast.success("Relatório atualizado com sucesso!");
    }
  };

  const handleDeleteConfirm = () => {
    if (reportToDelete) {
      setReports(prev => prev.filter(report => report.id !== reportToDelete.id));
      toast.success("Relatório excluído com sucesso!");
    }
  };

  return (
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen">
      <div className="bg-gray-50 overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col ml-[283px] p-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
              <p className="text-gray-600 mt-2">Gerencie seus documentos e relatórios</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar relatórios..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md px-4 py-2 bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileTextIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{report.name}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-500">{report.type}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{report.size}</span>
                      </div>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                        {report.category}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <MoreVerticalIcon className="w-5 h-5" />
                      </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content 
                        className="min-w-[180px] bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50"
                        align="end"
                        sideOffset={5}
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
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
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
        report={reportToEdit!}
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
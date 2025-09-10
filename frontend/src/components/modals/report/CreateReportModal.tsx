import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label} from "../../ui/label";
import { FileTextIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportFormData) => void;
}

interface ReportFormData {
  name: string;
  category: string;
  file: File | null;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<ReportFormData>({
    name: "",
    category: "Desempenho",
    file: null,
  });

  const categories = ["Desempenho", "Frequência", "Planos", "Outros"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate file size (example: max 10MB)
      if (formData.file && formData.file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. O tamanho máximo permitido é 10MB.");
        return;
      }

      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
      const fileExtension = formData.file?.name.toLowerCase().slice((formData.file?.name.lastIndexOf(".") || 0));
      if (formData.file && !allowedTypes.includes(fileExtension || '')) {
        toast.error("Tipo de arquivo não suportado. Use PDF, DOC, DOCX, XLS ou XLSX.");
        return;
      }

      await onSubmit(formData);
      toast.success("Relatório criado com sucesso!");
      onClose();
      
      // Reset form
      setFormData({
        name: "",
        category: "Desempenho",
        file: null,
      });
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Erro ao criar relatório. Tente novamente."
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
            Novo Relatório
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do relatório</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Relatório de Desempenho - 1º Bimestre"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
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
              Criar Relatório
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
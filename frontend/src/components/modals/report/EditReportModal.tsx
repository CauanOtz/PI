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

// Add Report interface
interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  category: string;
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
}

export const EditReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  report,
}: EditReportModalProps) => {
  const [formData, setFormData] = React.useState<EditReportData>({
    name: report?.name || "",
    category: report?.category || "",
  });

  React.useEffect(() => {
    if (report) {
      setFormData({
        name: report.name,
        category: report.category,
      });
    }
  }, [report]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Relatório</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Relatório</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do relatório"
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
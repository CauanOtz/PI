import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { PencilIcon } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  class: string;
  registrationNumber: string;
  status: 'active' | 'inactive';
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSubmit: (data: Student) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<Student | null>(student);

  React.useEffect(() => {
    setFormData(student);
  }, [student]);

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Digite o nome do aluno"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev!, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@escola.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev!, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Turma</Label>
            <Input
              id="class"
              placeholder="Ex: 9º Ano A"
              value={formData.class}
              onChange={(e) => setFormData(prev => ({ ...prev!, class: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Matrícula</Label>
            <Input
              id="registrationNumber"
              placeholder="Ex: 2024001"
              value={formData.registrationNumber}
              onChange={(e) => setFormData(prev => ({ ...prev!, registrationNumber: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => 
                setFormData(prev => ({ ...prev!, status: value }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
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
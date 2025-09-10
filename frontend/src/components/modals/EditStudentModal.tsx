import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PencilIcon } from "lucide-react";

interface BackendResponsavel {
  id: number;
  nome?: string;
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
    responsaveis?: BackendResponsavel[];
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
  const [responsaveisInput, setResponsaveisInput] = React.useState<string>("");

  // mesmo formatador usado no create
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  };

  React.useEffect(() => {
    if (student) {
      setFormData({
        id: student.id,
        nome: student.nome,
        idade: student.idade,
        endereco: student.endereco ?? "",
        contato: student.contato ?? "",
        responsaveisIds: student.responsaveis?.map(r => r.id) ?? [],
      });
      setResponsaveisInput((student.responsaveis?.map(r => r.id).join(",")) ?? "");
    } else {
      setFormData(null);
      setResponsaveisInput("");
    }
  }, [student]);

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const responsaveisIds = responsaveisInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter(n => !Number.isNaN(n));

    onSubmit({
      ...formData,
      idade: formData.idade ? Number(formData.idade) : undefined,
      responsaveisIds,
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

          <div className="space-y-2">
            <Label htmlFor="responsaveis">IDs dos responsáveis (ex: 1,2)</Label>
            <Input
              id="responsaveis"
              placeholder="IDs separados por vírgula"
              value={responsaveisInput}
              onChange={(e) => setResponsaveisInput(e.target.value)}
            />
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
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { PencilIcon, XIcon } from "lucide-react";
import { usuariosService } from "../../../services/users";
import { toast } from "sonner";
import { AssistidoFormData, EditAssistidoModalProps } from "./types";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<AssistidoFormData | null>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  React.useEffect(() => {
    if (student) {
      setFormData({
        id: student.id,
        nome: student.nome,
        dataNascimento: student.dataNascimento,
        sexo: student.sexo,
        cartaoSus: student.cartaoSus ?? "",
        rg: student.rg ?? "",
        endereco: student.endereco ?? "",
        bairro: student.bairro ?? "",
        cidade: student.cidade ?? "",
        cep: student.cep ?? "",
        contato: student.contato ?? "",
        contatoEmergencia: student.contatoEmergencia ?? "",
        observacoes: student.observacoes ?? "",
        mae: student.mae ?? "",
        pai: student.pai ?? "",
      });
    } else {
      setFormData(null);
    }
  }, [student]);



  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilIcon className="w-5 h-5 text-blue-600" />
            Editar Assistido
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              placeholder="Digite o nome do assistido"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev!, nome: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData(prev => ({ ...prev!, dataNascimento: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select 
                value={formData.sexo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev!, sexo: value as 'Masculino' | 'Feminino' }))}
              >
                <SelectTrigger id="sexo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cartaoSus">Cartão SUS</Label>
              <Input
                id="cartaoSus"
                placeholder="Número do cartão"
                value={formData.cartaoSus ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, cartaoSus: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                placeholder="Número do RG"
                value={formData.rg ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, rg: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              placeholder="Rua, número"
              value={formData.endereco ?? ""}
              onChange={(e) => setFormData(prev => ({ ...prev!, endereco: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                placeholder="Bairro"
                value={formData.bairro ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, bairro: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                placeholder="Cidade"
                value={formData.cidade ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, cidade: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                value={formData.cep ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, cep: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="contatoEmergencia">Contato de Emergência</Label>
              <Input
                id="contatoEmergencia"
                placeholder="(11) 9xxxx-xxxx"
                value={formData.contatoEmergencia ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, contatoEmergencia: formatPhone(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mae">Nome da Mãe</Label>
              <Input
                id="mae"
                placeholder="Nome completo"
                value={formData.mae ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, mae: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pai">Nome do Pai</Label>
              <Input
                id="pai"
                placeholder="Nome completo"
                value={formData.pai ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev!, pai: e.target.value }))}
              />
            </div>
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
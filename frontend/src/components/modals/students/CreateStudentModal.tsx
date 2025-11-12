import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { UserPlus } from "lucide-react";
import { AssistidoFormData, CreateAssistidoModalProps } from "./types";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

export const CreateStudentModal: React.FC<CreateAssistidoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<AssistidoFormData>({
    nome: "",
    dataNascimento: "",
    sexo: "Masculino",
    endereco: "",
    contato: "",
  });

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      cartaoSus: formData.cartaoSus || undefined,
      rg: formData.rg || undefined,
      bairro: formData.bairro || undefined,
      cidade: formData.cidade || undefined,
      cep: formData.cep || undefined,
      contatoEmergencia: formData.contatoEmergencia || undefined,
      mae: formData.mae || undefined,
      pai: formData.pai || undefined,
      problemasSaude: formData.problemasSaude || undefined,
    });
    setFormData({
      nome: "",
      dataNascimento: "",
      sexo: "Masculino",
      endereco: "",
      contato: "",
    });
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="w-full max-w-[640px] sm:max-w-[425px] max-h-[90vh] overflow-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Novo Assistido
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              placeholder="Digite o nome do aluno"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.dataNascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, dataNascimento: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select 
                value={formData.sexo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, sexo: value as 'Masculino' | 'Feminino' }))}
              >
                <SelectTrigger id="sexo" className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cartaoSus">Cartão SUS</Label>
              <Input
                id="cartaoSus"
                placeholder="Número do cartão"
                value={formData.cartaoSus ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cartaoSus: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                placeholder="Número do RG"
                value={formData.rg ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              placeholder="Rua, número"
              value={formData.endereco ?? ""}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                placeholder="Bairro"
                value={formData.bairro ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                placeholder="Cidade"
                value={formData.cidade ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                value={formData.cep ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contato">Contato</Label>
              <Input
                id="contato"
                placeholder="(11) 9xxxx-xxxx"
                value={formData.contato ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, contato: formatPhone(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contatoEmergencia">Contato de Emergência</Label>
              <Input
                id="contatoEmergencia"
                placeholder="(11) 9xxxx-xxxx"
                value={formData.contatoEmergencia ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, contatoEmergencia: formatPhone(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mae">Nome da Mãe</Label>
              <Input
                id="mae"
                placeholder="Nome completo"
                value={formData.mae ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, mae: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pai">Nome do Pai</Label>
              <Input
                id="pai"
                placeholder="Nome completo"
                value={formData.pai ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, pai: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemasSaude">Problemas de Saúde</Label>
            <Textarea
              id="problemasSaude"
              placeholder="Descreva condições de saúde relevantes (opcional)"
              value={formData.problemasSaude ?? ""}
              onChange={(e) => setFormData(prev => ({ ...prev, problemasSaude: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              Cadastrar Assistido
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
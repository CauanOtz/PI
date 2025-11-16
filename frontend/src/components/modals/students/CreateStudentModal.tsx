import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { UserPlus } from "lucide-react";
import { AssistidoFormData, CreateAssistidoModalProps } from "./types";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { ContatosSection } from "./ContatosSection";

export const CreateStudentModal: React.FC<CreateAssistidoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<AssistidoFormData>({
    nome: "",
    dataNascimento: "",
    sexo: "Masculino",
    contatos: [{ telefone: "", nomeContato: "", parentesco: "", ordemPrioridade: 1 }],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 [CreateStudentModal] handleSubmit iniciado');
    console.log('🔵 [CreateStudentModal] FormData atual:', JSON.stringify(formData, null, 2));
    
    // Validate at least one contact with phone
    if (!formData.contatos.some(c => c.telefone.trim())) {
      alert("É obrigatório cadastrar pelo menos um contato com telefone");
      return;
    }

    // Filter out empty contacts
    const validContatos = formData.contatos.filter(c => c.telefone.trim());
    
    const submitData = {
      ...formData,
      contatos: validContatos,
      cartaoSus: formData.cartaoSus || undefined,
      rg: formData.rg || undefined,
      numero: formData.numero || undefined,
      complemento: formData.complemento || undefined,
      problemasSaude: formData.problemasSaude || undefined,
    };
    
    console.log('🟢 [CreateStudentModal] Dados a enviar:', JSON.stringify(submitData, null, 2));
    onSubmit(submitData);
    
    // Reset form
    setFormData({
      nome: "",
      dataNascimento: "",
      sexo: "Masculino",
      contatos: [{ telefone: "", nomeContato: "", parentesco: "", ordemPrioridade: 1 }],
    });
    console.log('🟢 [CreateStudentModal] Form resetado');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[800px] max-h-[90vh] overflow-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Novo Assistido
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                placeholder="Digite o nome do assistido"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
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
                <Label htmlFor="sexo">Sexo *</Label>
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
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={formData.endereco?.cep ?? ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endereco: { ...(prev.endereco || {}), cep: e.target.value } 
                  }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  placeholder="Rua, Avenida..."
                  value={formData.endereco?.logradouro ?? ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endereco: { ...(prev.endereco || {}), logradouro: e.target.value } 
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  placeholder="123"
                  value={formData.numero ?? ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  placeholder="Apto, Bloco..."
                  value={formData.complemento ?? ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  placeholder="Bairro"
                  value={formData.endereco?.bairro ?? ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endereco: { ...(prev.endereco || {}), bairro: e.target.value } 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                  value={formData.endereco?.cidade ?? ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endereco: { ...(prev.endereco || {}), cidade: e.target.value } 
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado (UF)</Label>
              <Input
                id="estado"
                placeholder="SP"
                maxLength={2}
                value={formData.endereco?.estado ?? ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  endereco: { ...(prev.endereco || {}), estado: e.target.value.toUpperCase() } 
                }))}
              />
            </div>
          </div>

          {/* Contatos */}
          <ContatosSection
            contatos={formData.contatos}
            onChange={(contatos) => setFormData(prev => ({ ...prev, contatos }))}
          />

          {/* Filiação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Filiação</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mae">Nome da Mãe</Label>
                <Input
                  id="mae"
                  placeholder="Nome completo"
                  value={formData.filiacao?.mae ?? ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    filiacao: { ...(prev.filiacao || {}), mae: e.target.value } 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pai">Nome do Pai</Label>
                <Input
                  id="pai"
                  placeholder="Nome completo"
                  value={formData.filiacao?.pai ?? ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    filiacao: { ...(prev.filiacao || {}), pai: e.target.value } 
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Saúde */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações de Saúde</h3>
            
            <div className="space-y-2">
              <Label htmlFor="problemasSaude">Problemas de Saúde</Label>
              <Textarea
                id="problemasSaude"
                placeholder="Descreva condições de saúde, alergias ou medicamentos (opcional)"
                value={formData.problemasSaude ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, problemasSaude: e.target.value }))}
                rows={3}
              />
            </div>
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
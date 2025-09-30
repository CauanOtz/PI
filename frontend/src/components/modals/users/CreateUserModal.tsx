import React from "react";
import { digitsOnly, formatCPF as maskCPF, isValidCPF } from "../../../lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CreateUserData {
  nome: string;
  email?: string;
  telefone?: string;
  cpf: string; 
  senha: string;
  role?: "admin" | "responsavel";
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => void;
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
};

const cleanDigits = digitsOnly;

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = React.useState<CreateUserData>({ nome: "", email: "", telefone: "", cpf: "", senha: "", role: "responsavel" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cpfClean = cleanDigits(form.cpf);
    if (cpfClean.length !== 11) {
      toast.error("CPF inválido — informe 11 dígitos.");
      return;
    }
    if (!isValidCPF(cpfClean)) {
      toast.error("CPF inválido.");
      return;
    }
    onSubmit({ ...form, cpf: cpfClean }); // envia somente dígitos (inclui role)
    setForm({ nome: "", email: "", telefone: "", cpf: "", senha: "" });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" /> Novo Usuário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={form.nome} onChange={(e) => setForm(s => ({ ...s, nome: e.target.value }))} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" placeholder="(11) 98765-4321" value={form.telefone} onChange={(e) => setForm(s => ({ ...s, telefone: formatPhone(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={form.cpf}
              maxLength={14} /* 000.000.000-00 */
              onChange={(e) => {
                const formatted = maskCPF(e.target.value);
                if (formatted.length <= 14) {
                  setForm(s => ({ ...s, cpf: formatted }));
                }
              }}
              onKeyDown={(e) => {
                // Bloqueia entrada adicional se já completo
                const isDigit = /[0-9]/.test(e.key);
                if (isDigit && digitsOnly(form.cpf).length >= 11 && window.getSelection()?.toString() === '') {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" value={form.senha} onChange={(e) => setForm(s => ({ ...s, senha: e.target.value }))} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Papel</Label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm(s => ({ ...s, role: e.target.value as "admin" | "responsavel" }))}
              className="w-full rounded border px-3 py-2"
            >
              <option value="responsavel">Responsável</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Criar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
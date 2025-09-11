import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { PencilIcon } from "lucide-react";

interface EditUserData {
  id?: number;
  nome: string;
  email?: string;
  telefone?: string;
  cpf: string;
  role?: "admin" | "responsavel";
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EditUserData | null;
  onSubmit: (data: EditUserData) => void;
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
};

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSubmit }) => {
  const [form, setForm] = React.useState<EditUserData | null>(null);

  React.useEffect(() => {
    if (user) setForm({ ...user });
    else setForm(null);
  }, [user]);

  if (!form) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilIcon className="w-5 h-5 text-blue-600" /> Editar Usuário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={form.nome} onChange={(e) => setForm(f => ({ ...f!, nome: e.target.value }))} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email ?? ""} onChange={(e) => setForm(f => ({ ...f!, email: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" placeholder="(11) 98765-4321" value={form.telefone ?? ""} onChange={(e) => setForm(f => ({ ...f!, telefone: formatPhone(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" value={form.cpf} onChange={(e) => setForm(f => ({ ...f!, cpf: e.target.value }))} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Papel</Label>
            <select
              id="role"
              value={form.role ?? "responsavel"}
              onChange={(e) => setForm(f => ({ ...f!, role: e.target.value as "admin" | "responsavel" }))}
              className="w-full rounded border px-3 py-2"
            >
              <option value="responsavel">Responsável</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
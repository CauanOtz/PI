import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
// Removed unused Input import

interface Student {
  id: number;
  nome: string;
  matricula?: string;
  idade?: number;
  endereco?: string;
  [k: string]: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  responsavelName?: string;
  students?: Student[] | null;
  loading?: boolean;
  onViewProfile?: (studentId: number) => void;
  onUnlink?: (studentId: number) => Promise<void> | void;
  onEdit?: (studentId: number) => void;
}

export const ResponsavelStudentsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  responsavelName,
  students = null,
  loading = false,
  onViewProfile,
  onUnlink,
  onEdit
}) => {
  const count = Array.isArray(students) ? students.length : 0;
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    setQuery("");
  }, [isOpen]);

  const filtered = React.useMemo(() => {
    if (!Array.isArray(students)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s =>
      String(s.id).includes(q) ||
      (s.nome && s.nome.toLowerCase().includes(q)) ||
      (s.matricula && String(s.matricula).toLowerCase().includes(q))
    );
  }, [students, query]);

  const handleUnlink = async (id: number) => {
    if (!onUnlink) return;
    if (!window.confirm("Remover vínculo do responsável com este aluno?")) return;
    try { await onUnlink(id); } catch (e) { /* só chamar os handlers caso eu precise debuggar */ }
  };

  const handleCopy = (v: string | number) => {
    try { navigator.clipboard?.writeText(String(v)); } catch (e) { /* ignore */ }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <div className="flex items-start justify-between w-full gap-4">
            <div>
              <DialogTitle className="text-lg font-semibold">Alunos do responsável</DialogTitle>
              <div className="mt-1 text-sm text-gray-600">
                <span className="font-medium">{responsavelName ?? "-"}</span>
                <span className="text-gray-400"> — </span>
                <span className="text-sm text-gray-500">{count} aluno(s)</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : !Array.isArray(students) ? (
            <div className="text-center py-8 text-gray-500">Nenhum dado.</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum aluno vinculado.</div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-full w-full table-auto">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-4 py-3 w-16">ID</th>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3 hidden sm:table-cell w-36">Matrícula</th>
                      <th className="px-4 py-3 hidden md:table-cell w-24">Idade</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Endereço</th>
                      <th className="px-4 py-3 text-right w-40">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-white">
                        <td className="px-4 py-3 align-top text-sm text-gray-700">#{a.id}</td>
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-sm">{a.nome}</div>
                          {a.email && <div className="text-xs text-gray-500 mt-1 truncate max-w-[420px]">{a.email}</div>}
                        </td>
                        <td className="px-4 py-3 align-top hidden sm:table-cell text-sm text-gray-700">{a.matricula ?? "—"}</td>
                        <td className="px-4 py-3 align-top hidden md:table-cell text-sm text-gray-700">{a.idade ?? "—"}</td>
                        <td className="px-4 py-3 align-top hidden lg:table-cell text-sm text-gray-600 truncate max-w-[400px]">{a.endereco ?? "—"}</td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleCopy(a.id)}>Copiar ID</Button>
                            {onViewProfile && <Button size="sm" variant="ghost" onClick={() => onViewProfile(a.id)}>Ver</Button>}
                            {onEdit && <Button size="sm" variant="ghost" onClick={() => onEdit(a.id)}>Editar</Button>}
                            {onUnlink && <Button size="sm" variant="destructive" onClick={() => handleUnlink(a.id)}>Desvincular</Button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-gray-600">Total: <span className="font-medium">{filtered.length}</span></div>
            <div>
              <Button onClick={onClose} variant="outline">Fechar</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResponsavelStudentsModal;
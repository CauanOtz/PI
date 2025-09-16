import React, { useEffect, useState } from 'react';
import { SidebarSection } from '../../components/layout/SidebarSection';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { DeleteConfirmationModal } from '../../components/modals/shared/DeleteConfirmationModal';
import { listAulas, createAula, updateAula, deleteAula } from '../../services/class';
import CreateAulaModal from '../../components/modals/aulas/CreateClassModal';
import EditAulaModal from '../../components/modals/aulas/EditClassmodal';
import { toast } from 'sonner';

export const Class: React.FC = () => {
  const [aulas, setAulas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listAulas();
      setAulas(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao carregar aulas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload: any) => {
    try {
      await createAula(payload);
      toast.success('Aula criada');
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao criar aula');
    }
  };

  const handleEdit = async (id: number, payload: any) => {
    try {
      await updateAula(id, payload);
      toast.success('Aula atualizada');
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao atualizar aula');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAula(id);
      toast.success('Aula removida');
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao remover aula');
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full mt-16">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Aulas</h1>
            <p className="text-slate-600">Gerencie as aulas da escola</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input className="pl-10 w-52" placeholder="Buscar aulas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <PlusIcon className="w-4 h-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando...</div>
              ) : aulas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma aula cadastrada.</div>
              ) : (
                <div className="overflow-auto">
                  <div className="min-w-[700px]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Título</th>
                          <th className="text-center p-4 hidden sm:table-cell">Data</th>
                          <th className="text-center p-4 hidden md:table-cell">Horário</th>
                          <th className="text-center p-4 hidden lg:table-cell">ID</th>
                          <th className="text-center p-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aulas.filter(a => a.titulo?.toLowerCase().includes(searchTerm.toLowerCase() || ''))
                        .map(a => (
                          <tr key={a.id} className="border-b last:border-0">
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{a.titulo}</div>
                                <div className="text-sm text-gray-500 sm:hidden">#{a.id}</div>
                              </div>
                            </td>
                            <td className="p-4 text-center hidden sm:table-cell">{a.data}</td>
                            <td className="p-4 text-center hidden md:table-cell">{a.horario}</td>
                            <td className="p-4 text-center hidden lg:table-cell">#{a.id}</td>
                            <td className="p-4">
                              <div className="flex justify-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { setEditing(a); setEditOpen(true); }} className="text-blue-600 hover:text-blue-700">
                                  <PencilIcon className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(a)} className="text-red-600 hover:text-red-700">
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <CreateAulaModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
        <EditAulaModal isOpen={editOpen} onClose={() => setEditOpen(false)} aula={editing} onSubmit={handleEdit} />
        <DeleteConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => { if (deleteTarget) { handleDelete(deleteTarget.id); setDeleteTarget(null); } }}
          title="Remover Aula"
          description={`Tem certeza que deseja remover a aula "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}
        />
        </div>
      </div>
    </div>
  );
};

export default Class;

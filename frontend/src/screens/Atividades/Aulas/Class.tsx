import { useEffect, useState } from 'react';
import { SidebarSection } from '../../components/layout/SidebarSection';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { DeleteConfirmationModal } from '../../components/modals/shared/DeleteConfirmationModal';
import { listAtividades, createAtividade, updateAtividade, deleteAtividade, Atividade } from '../../services/atividade';
import CreateAtividadeModal from '../../components/modals/atividades/CreateAtividadeModal';
import EditAtividadeModal from '../../components/modals/atividades/EditAtividadeModal';
import { toast } from 'sonner';

export const Class: React.FC = () => {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listAtividades();
      setAtividades(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload: any) => {
    try {
      await createAtividade(payload);
      toast.success('Atividade criada');
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao criar aula');
    }
  };

  const handleEdit = async (id: number, payload: any) => {
    try {
      await updateAtividade(id, payload);
      toast.success('Atividade atualizada');
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao atualizar aula');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAtividade(id);
      toast.success('Atividade removida');
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao remover aula');
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full mt-16 min-h-screen">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px] pb-20">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Atividades</h1>
              <p className="text-gray-600 mt-1">Gerencie as atividades da ANG</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <PlusIcon className="w-4 h-4 mr-2" />
              Nova Atividade
            </Button>
          </div>

          {/* Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 px-1">
              <span>Total: {atividades.length}</span>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="min-w-[780px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Título</th>
                    <th className="text-center p-4">Data</th>
                    <th className="text-center p-4 hidden sm:table-cell">Horário</th>
                    <th className="text-center p-4 hidden md:table-cell">ID</th>
                    <th className="text-center p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center">Carregando...</td></tr>
                  ) : atividades.filter((a: Atividade) => a.titulo?.toLowerCase().includes(searchTerm.toLowerCase() || '')).length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhuma atividade encontrada</td></tr>
                  ) : (
                    atividades
                      .filter((a: Atividade) => a.titulo?.toLowerCase().includes(searchTerm.toLowerCase() || ''))
                      .map((a: Atividade) => (
                        <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-slate-800">{a.titulo}</div>
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">{a.data || '-'}</td>
                          <td className="p-4 text-center whitespace-nowrap hidden sm:table-cell">{a.horario || '-'}</td>
                          <td className="p-4 text-center whitespace-nowrap hidden md:table-cell">#{a.id}</td>
                          <td className="p-4">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setEditing(a); setEditOpen(true); }} className="text-blue-600 hover:text-blue-700">
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(a)} className="text-red-600 hover:text-red-700">
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <CreateAtividadeModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
          <EditAtividadeModal isOpen={editOpen} onClose={() => setEditOpen(false)} atividade={editing} onSubmit={handleEdit} />
          <DeleteConfirmationModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => { if (deleteTarget) { handleDelete(deleteTarget.id); setDeleteTarget(null); } }}
            title="Remover Atividade"
            description={`Tem certeza que deseja remover a atividade "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}
          />
        </div>
      </div>
    </div>
  );
};

export default Class;

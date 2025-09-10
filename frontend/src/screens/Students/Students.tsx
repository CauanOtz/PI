import { useEffect, useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CreateStudentModal } from "../../components/modals/students/CreateStudentModal";
import { EditStudentModal } from "../../components/modals/students/EditStudentModal";
import { DeleteConfirmationModal } from "../../components/modals/shared/DeleteConfirmationModal";
import { studentsService, BackendAluno } from "../../services/students";

export const Students = (): JSX.Element => {
  const [students, setStudents] = useState<BackendAluno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentToDelete, setStudentToDelete] = useState<BackendAluno | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<BackendAluno | null>(null);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(10);

  const load = async () => {
    try {
      setLoading(true);
      const dados = await studentsService.list({ page, limit, search: searchTerm || undefined });
      setStudents(dados.alunos);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.mensagem || "Falha ao carregar alunos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  const handleDelete = async (id: number) => {
    try {
      await studentsService.remove(id);
      toast.success("Aluno removido com sucesso!");
      // recarrega
      load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.mensagem || "Falha ao remover aluno");
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full mt-16">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Alunos</h1>
              <p className="text-gray-600 mt-1">Gerenciamento de alunos</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar aluno por nome ou contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="min-w-[700px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Nome</th>
                    <th className="text-center p-4 hidden sm:table-cell">Contato</th>
                    <th className="text-center p-4 hidden md:table-cell">Endereço</th>
                    <th className="text-center p-4 hidden lg:table-cell">Idade</th>
                    <th className="text-center p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center">Carregando...</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum aluno encontrado</td></tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{student.nome}</div>
                            <div className="text-sm text-gray-500 sm:hidden">{student.contato}</div>
                          </div>
                        </td>
                        <td className="p-4 text-center hidden sm:table-cell">{student.contato}</td>
                        <td className="p-4 text-center hidden md:table-cell">{student.endereco}</td>
                        <td className="p-4 text-center hidden lg:table-cell">{student.idade ?? "-"}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingStudent(student)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setStudentToDelete(student)}
                              className="text-red-600 hover:text-red-700"
                            >
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
        </div>
      </div>

      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          try {
            const payload = {
              nome: data.nome,
              idade: data.idade,
              endereco: data.endereco,
              contato: data.contato,
              responsaveisIds: data.responsaveisIds ?? [],
            } as Partial<BackendAluno>;

            await studentsService.create(payload);
            toast.success("Aluno cadastrado com sucesso!");
            setIsCreateModalOpen(false);
            load();
          } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.mensagem || "Falha ao cadastrar aluno");
          }
        }}
      />

      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSubmit={async (data) => {
          try {
            if (!editingStudent) return;
            const payload = {
              nome: data.nome ?? editingStudent.nome,
              idade: data.idade ?? editingStudent.idade,
              endereco: data.endereco ?? editingStudent.endereco,
              contato: data.contato ?? editingStudent.contato,
              responsaveisIds: data.responsaveisIds ?? editingStudent.responsaveis?.map(r => r.id) ?? [],
            } as Partial<BackendAluno>;

            await studentsService.update(editingStudent.id, payload);
            toast.success("Dados do aluno atualizados com sucesso!");
            setEditingStudent(null);
            load();
          } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.mensagem || "Falha ao atualizar aluno");
          }
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            handleDelete(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        title="Remover Aluno"
        description={`Tem certeza que deseja remover o aluno ${studentToDelete?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};
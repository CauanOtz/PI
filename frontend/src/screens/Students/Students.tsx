import { useEffect, useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CreateStudentModal } from "../../components/modals/students/CreateStudentModal";
import { EditStudentModal } from "../../components/modals/students/EditStudentModal";
import { DeleteConfirmationModal } from "../../components/modals/shared/DeleteConfirmationModal";
import { studentsService, BackendAssistido } from "../../services/students";
import { AssistidoFormData } from "../../components/modals/students/types";

export const Students = (): JSX.Element => {
  const [students, setStudents] = useState<BackendAssistido[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentToDelete, setStudentToDelete] = useState<BackendAssistido | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<BackendAssistido | null>(null);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(10);

  const load = async () => {
    try {
      setLoading(true);
      const dados = await studentsService.list({ page, limit, search: searchTerm || undefined });
      setStudents(dados.assistidos);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.mensagem || "Falha ao carregar Assistidos");
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
      toast.success("Assistido removido com sucesso!");
      // recarrega
      load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.mensagem || "Falha ao remover assistido");
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full mt-16">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Assistidos</h1>
              <p className="text-gray-600 mt-1">Gerenciamento de Assistidos</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Novo Assistido
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar assistido por nome ou contato..."
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
                    <th className="text-center p-4">Nascimento</th>
                    <th className="text-center p-4">Sexo</th>
                    <th className="text-center p-4 hidden sm:table-cell">Contato</th>
                    <th className="text-center p-4 hidden md:table-cell">Endereço</th>
                    <th className="text-center p-4 hidden lg:table-cell">Pais</th>
                    <th className="text-center p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="p-8 text-center">Carregando...</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">Nenhum assistido encontrado</td></tr>
                  ) : students.map((student) => {
                      // Calcular idade
                      const hoje = new Date();
                      const nascimento = new Date(student.dataNascimento);
                      let idade = hoje.getFullYear() - nascimento.getFullYear();
                      const mes = hoje.getMonth() - nascimento.getMonth();
                      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                        idade--;
                      }

                      return (
                        <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{student.nome}</div>
                              {student.cartaoSus && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                    SUS: {student.cartaoSus}
                                  </span>
                                </div>
                              )}
                              {student.rg && (
                                <div className="text-xs text-gray-500 mt-1">
                                  RG: {student.rg}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {idade} anos<br/>
                            <span className="text-xs text-gray-500">
                              {new Date(student.dataNascimento).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4 text-center">{student.sexo}</td>
                          <td className="p-4 text-center hidden sm:table-cell">
                            {student.contato ?? "-"}
                            {student.cidade && (
                              <div className="text-xs text-gray-500 mt-1">{student.cidade}</div>
                            )}
                          </td>
                          <td className="p-4 text-center hidden md:table-cell">
                            <div>{student.endereco ?? "-"}</div>
                            {student.bairro && (
                              <div className="text-xs text-gray-500">{student.bairro}</div>
                            )}
                            {student.cep && (
                              <div className="text-xs text-gray-500">CEP: {student.cep}</div>
                            )}
                            {student.problemasSaude && (
                              <div className="mt-1 group relative inline-block">
                                <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full cursor-help flex items-center gap-1">
                                  <AlertCircleIcon className="w-3 h-3" />
                                  Condição de Saúde
                                </span>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded p-2 shadow-lg">
                                  <p className="font-semibold mb-1">Condições de Saúde:</p>
                                  <p>{student.problemasSaude}</p>
                                  {student.medicamentosAlergias && (
                                    <>
                                      <p className="font-semibold mt-2 mb-1">Medicamentos e Alergias:</p>
                                      <p>{student.medicamentosAlergias}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center hidden lg:table-cell">
                            {student.mae && (
                              <div className="text-sm">
                                Mãe: <span className="text-gray-600">{student.mae}</span>
                              </div>
                            )}
                            {student.pai && (
                              <div className="text-sm">
                                Pai: <span className="text-gray-600">{student.pai}</span>
                              </div>
                            )}
                            {!student.mae && !student.pai && "-"}
                          </td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data: AssistidoFormData) => {
          try {
            await studentsService.create(data);
            toast.success("Assistido cadastrado com sucesso!");
            setIsCreateModalOpen(false);
            load();
          } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.mensagem || "Falha ao cadastrar assistido");
          }
        }}
      />

      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSubmit={async (data: AssistidoFormData) => {
          try {
            if (!editingStudent) return;
            await studentsService.update(editingStudent.id, data);
            toast.success("Dados do assistido atualizados com sucesso!");
            setEditingStudent(null);
            load();
          } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.mensagem || "Falha ao atualizar assistido");
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
        title="Remover Assistido"
        description={`Tem certeza que deseja remover o assistido ${studentToDelete?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};
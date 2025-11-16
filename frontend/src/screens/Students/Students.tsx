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

// Helper function to convert form data to backend format
const convertFormDataToBackend = (formData: AssistidoFormData): Partial<BackendAssistido> => {
  console.log('🔵 [convertFormDataToBackend] FormData recebido:', JSON.stringify(formData, null, 2));
  
  const backendData: Partial<BackendAssistido> = {
    nome: formData.nome,
    dataNascimento: formData.dataNascimento,
    sexo: formData.sexo,
    cartaoSus: formData.cartaoSus,
    rg: formData.rg,
    numero: formData.numero,
    complemento: formData.complemento,
    problemasSaude: formData.problemasSaude,
  };

  // Convert endereco if provided
  if (formData.endereco) {
    console.log('🟢 [convertFormDataToBackend] Endereco encontrado:', formData.endereco);
    backendData.endereco = {
      cep: formData.endereco.cep || '',
      logradouro: formData.endereco.logradouro || '',
      bairro: formData.endereco.bairro || '',
      cidade: formData.endereco.cidade || '',
      estado: formData.endereco.estado || '',
    };
    console.log('🟢 [convertFormDataToBackend] Endereco convertido:', backendData.endereco);
  } else {
    console.log('🔴 [convertFormDataToBackend] Nenhum endereço fornecido');
  }

  // Convert contatos array
  if (formData.contatos && formData.contatos.length > 0) {
    console.log('🟢 [convertFormDataToBackend] Contatos encontrados:', formData.contatos.length);
    backendData.contatos = formData.contatos.map(contato => ({
      telefone: contato.telefone || '',
      nomeContato: contato.nomeContato || '',
      parentesco: contato.parentesco || '',
      ordemPrioridade: contato.ordemPrioridade || 1,
    }));
  }

  // Convert filiacao if provided
  if (formData.filiacao) {
    console.log('🟢 [convertFormDataToBackend] Filiacao encontrada:', formData.filiacao);
    backendData.filiacao = {
      mae: formData.filiacao.mae,
      pai: formData.filiacao.pai,
    };
  } else {
    console.log('🔴 [convertFormDataToBackend] Nenhuma filiação fornecida');
  }

  console.log('🔵 [convertFormDataToBackend] BackendData final:', JSON.stringify(backendData, null, 2));
  return backendData;
};

export const Students = (): JSX.Element => {
  const [students, setStudents] = useState<BackendAssistido[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentToDelete, setStudentToDelete] = useState<BackendAssistido | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<BackendAssistido | null>(null);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(10);
  const [showAllColumns, setShowAllColumns] = useState(false);

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
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Novo Assistido
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowAllColumns((v) => !v)}
                className="inline-flex"
                aria-pressed={showAllColumns}
              >
                {showAllColumns ? 'Ver menos' : 'Ver mais'}
              </Button>
            </div>
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
                    <th className="text-center p-4">Contato</th>
                    <th className={"text-center p-4 " + (showAllColumns ? "table-cell" : "hidden")}>Endereço</th>
                    <th className={"text-center p-4 " + (showAllColumns ? "table-cell" : "hidden")}>Pais</th>
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
                            <div className="flex flex-col">
                              <div className="font-medium truncate mb-1">{student.nome}</div>
                              
                              <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mb-1">
                                {student.rg && (
                                  <span>RG: <span className="text-gray-700">{student.rg}</span></span>
                                )}
                                {student.endereco?.cidade && student.endereco?.estado && (
                                  <span>{student.endereco.cidade} - {student.endereco.estado}</span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {student.cartaoSus && (
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                                    SUS: {student.cartaoSus}
                                  </span>
                                )}
                                {student.problemasSaude && (
                                  <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full cursor-help inline-flex items-center gap-1 whitespace-nowrap group relative">
                                    <AlertCircleIcon className="w-3 h-3" />
                                    Condição de Saúde
                                    <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10">
                                      <span className="font-semibold block mb-1">Condições de Saúde:</span>
                                      <span className="whitespace-pre-wrap block">{student.problemasSaude}</span>
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center align-middle">
                            {idade} anos<br/>
                            <span className="text-xs text-gray-500">
                              {new Date(student.dataNascimento).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4 text-center align-middle">{student.sexo}</td>
                          <td className="p-4 text-center align-middle">
                            {student.contatos && student.contatos.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {student.contatos.map((contato, idx) => (
                                  <div key={idx}>
                                    {contato.telefone}
                                    {contato.nomeContato && (
                                      <div className="text-xs text-gray-500">
                                        {contato.nomeContato}
                                        {contato.parentesco && ` (${contato.parentesco})`}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : "-"}
                          </td>
                          <td className={"p-4 text-left align-middle max-w-[320px] " + (showAllColumns ? "table-cell" : "hidden")}>
                            <div className="flex flex-col gap-1">
                              {student.endereco ? (
                                <>
                                  <div className="font-medium truncate">
                                    {student.endereco.logradouro}
                                    {student.numero && `, ${student.numero}`}
                                    {student.complemento && ` - ${student.complemento}`}
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    {student.endereco.bairro && (
                                      <div className="text-xs text-gray-500 truncate">{student.endereco.bairro}</div>
                                    )}
                                    {student.endereco.cep && (
                                      <div className="text-xs text-gray-500">CEP: {student.endereco.cep}</div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div>-</div>
                              )}

                              
                            </div>
                          </td>
                          <td className={"p-4 text-center align-middle " + (showAllColumns ? "table-cell" : "hidden")}>
                            {student.filiacao?.mae && (
                              <div className="text-sm">
                                Mãe: <span className="text-gray-600">{student.filiacao.mae}</span>
                              </div>
                            )}
                            {student.filiacao?.pai && (
                              <div className="text-sm">
                                Pai: <span className="text-gray-600">{student.filiacao.pai}</span>
                              </div>
                            )}
                            {!student.filiacao?.mae && !student.filiacao?.pai && "-"}
                          </td>
                          <td className="p-4 align-middle">
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
          console.log('🔵 [Students.tsx] onSubmit recebido');
          console.log('🔵 [Students.tsx] Data recebida do modal:', JSON.stringify(data, null, 2));
          try {
            const backendData = convertFormDataToBackend(data);
            console.log('🟢 [Students.tsx] Enviando para API:', JSON.stringify(backendData, null, 2));
            await studentsService.create(backendData);
            console.log('🟢 [Students.tsx] Assistido criado com sucesso');
            toast.success("Assistido cadastrado com sucesso!");
            setIsCreateModalOpen(false);
            load();
          } catch (err: any) {
            console.error('🔴 [Students.tsx] Erro ao criar:', err);
            toast.error(err?.response?.data?.mensagem || "Falha ao cadastrar assistido");
          }
        }}
      />

      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        assistido={editingStudent}
        onSubmit={async (data: AssistidoFormData) => {
          console.log('🔵 [Students.tsx] EditModal onSubmit recebido');
          console.log('🔵 [Students.tsx] Data do EditModal:', JSON.stringify(data, null, 2));
          try {
            if (!editingStudent) return;
            const backendData = convertFormDataToBackend(data);
            console.log('🟢 [Students.tsx] Enviando UPDATE para API:', JSON.stringify(backendData, null, 2));
            await studentsService.update(editingStudent.id, backendData);
            console.log('🟢 [Students.tsx] Assistido atualizado com sucesso');
            toast.success("Dados do assistido atualizados com sucesso!");
            setEditingStudent(null);
            load();
          } catch (err: any) {
            console.error('🔴 [Students.tsx] Erro ao atualizar:', err);
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
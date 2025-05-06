import React, { useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  PlusIcon, 
  SearchIcon, 
  PencilIcon, 
  TrashIcon 
} from "lucide-react";
import { toast } from "sonner";
import { CreateStudentModal } from "../../components/modals/CreateStudentModal";
import { EditStudentModal } from "../../components/modals/EditStudentModal";
import { DeleteConfirmationModal } from "../../components/modals/DeleteConfirmationModal";

interface Student {
  id: number;
  name: string;
  email: string;
  class: string;
  registrationNumber: string;
  status: 'active' | 'inactive';
}

const mockStudents: Student[] = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@escola.com",
    class: "9º Ano A",
    registrationNumber: "2024001",
    status: 'active'
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@escola.com",
    class: "9º Ano A",
    registrationNumber: "2024002",
    status: 'active'
  },
  // Add more mock data as needed
];

export const Students = (): JSX.Element => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.includes(searchTerm)
  );

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
                placeholder="Buscar aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Nome</th>
                    <th className="text-left p-4 hidden sm:table-cell">Email</th>
                    <th className="text-left p-4 hidden md:table-cell">Turma</th>
                    <th className="text-left p-4 hidden lg:table-cell">Matrícula</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-right p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500 sm:hidden">{student.email}</div>
                          <div className="text-sm text-gray-500 md:hidden">{student.class}</div>
                          <div className="text-sm text-gray-500 lg:hidden">{student.registrationNumber}</div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">{student.email}</td>
                      <td className="p-4 hidden md:table-cell">{student.class}</td>
                      <td className="p-4 hidden lg:table-cell">{student.registrationNumber}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${student.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => {
          setStudents(prev => [...prev, { ...data, id: prev.length + 1 }]);
          toast.success("Aluno cadastrado com sucesso!");
          setIsCreateModalOpen(false);
        }}
      />

      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSubmit={(data) => {
          setStudents(prev => 
            prev.map(s => s.id === data.id ? data : s)
          );
          toast.success("Dados do aluno atualizados com sucesso!");
          setEditingStudent(null);
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
            toast.success("Aluno removido com sucesso!");
            setStudentToDelete(null);
          }
        }}
        title="Remover Aluno"
        description={`Tem certeza que deseja remover o aluno ${studentToDelete?.name}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};
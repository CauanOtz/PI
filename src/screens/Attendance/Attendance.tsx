import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../components/ui/button";
import { SidebarSection } from "../Teachers/sections/SidebarSection";
import { Checkbox } from "../../components/ui/checkbox";

interface Student {
  id: number;
  name: string;
  present: boolean;
  absent: boolean;
}

const mockStudents: Student[] = [
  { id: 1, name: "João Silva", present: false, absent: false },
  { id: 2, name: "Maria Santos", present: false, absent: false },
  { id: 3, name: "Pedro Oliveira", present: false, absent: false },
  { id: 4, name: "Ana Costa", present: false, absent: false },
  { id: 5, name: "Lucas Pereira", present: false, absent: false },
];

export const Attendance = (): JSX.Element => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleAttendance = (studentId: number, type: 'present' | 'absent') => {
    setStudents(students.map(student =>
      student.id === studentId
        ? {
            ...student,
            present: type === 'present' ? !student.present : false,
            absent: type === 'absent' ? !student.absent : false
          }
        : student
    ));
  };

  const saveAttendance = () => {
    console.log("Salvando presença:", students);
    alert("Presenças salvas com sucesso!");
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        
        <div className="flex flex-col ml-[283px] p-8">
          <h1 className="text-2xl font-bold mb-4">Controle de Presença</h1>
          <p className="text-gray-600 mb-6">{currentDate}</p>

          <div className="bg-white rounded-lg shadow-md p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4">Aluno</th>
                  <th className="text-center py-4">Presente</th>
                  <th className="text-center py-4">Ausente</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="py-4">{student.name}</td>
                    <td className="text-center py-4">
                      <Checkbox
                        checked={student.present}
                        onCheckedChange={() => handleAttendance(student.id, 'present')}
                        className="border-green-500 data-[state=checked]:bg-green-500"
                      />
                    </td>
                    <td className="text-center py-4">
                      <Checkbox
                        checked={student.absent}
                        onCheckedChange={() => handleAttendance(student.id, 'absent')}
                        className="border-red-500 data-[state=checked]:bg-red-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <Button onClick={saveAttendance} className="bg-green-600 hover:bg-green-700">
                Salvar Presenças
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
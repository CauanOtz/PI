import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../components/ui/button";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Checkbox } from "../../components/ui/checkbox";
import { CalendarIcon, PencilIcon, SaveIcon, XIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "../../components/modals/shared/DeleteConfirmationModal";

interface Student {
  id: number;
  name: string;
  present: boolean;
  absent: boolean;
}

interface AttendanceRecord {
  date: string;
  period: string;
  students: Student[];
}

const mockStudents: Student[] = [
  { id: 1, name: "João Silva", present: false, absent: false },
  { id: 2, name: "Maria Santos", present: false, absent: false },
  { id: 3, name: "Pedro Oliveira", present: false, absent: false },
  { id: 4, name: "Ana Costa", present: false, absent: false },
  { id: 5, name: "Lucas Pereira", present: false, absent: false },
];

const periods = [
  "1º Período - 07:00",
  "2º Período - 08:00",
  "3º Período - 09:00",
  "4º Período - 10:00",
  "5º Período - 11:00",
];

export const Attendance = (): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periods[0]);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);

  const handleAttendance = (studentId: number, type: 'present' | 'absent') => {
    const studentsToUpdate = editingRecord ? 
      editingRecord.students : 
      students;

    const updatedStudents = studentsToUpdate.map(student =>
      student.id === studentId
        ? {
            ...student,
            present: type === 'present' ? !student.present : false,
            absent: type === 'absent' ? !student.absent : false
          }
        : student
    );

    if (editingRecord) {
      setEditingRecord({ ...editingRecord, students: updatedStudents });
    } else {
      setStudents(updatedStudents);
    }
  };

  const markAllPresent = () => {
    const studentsToUpdate = editingRecord ? 
      editingRecord.students : 
      students;

    const updatedStudents = studentsToUpdate.map(student => ({
      ...student,
      present: true,
      absent: false
    }));

    if (editingRecord) {
      setEditingRecord({ ...editingRecord, students: updatedStudents });
    } else {
      setStudents(updatedStudents);
    }
    
    toast.success("Todos os alunos marcados como presentes");
  };

  const markAllAbsent = () => {
    const studentsToUpdate = editingRecord ? 
      editingRecord.students : 
      students;

    const updatedStudents = studentsToUpdate.map(student => ({
      ...student,
      present: false,
      absent: true
    }));

    if (editingRecord) {
      setEditingRecord({ ...editingRecord, students: updatedStudents });
    } else {
      setStudents(updatedStudents);
    }
    
    toast.success("Todos os alunos marcados como ausentes");
  };

  const saveAttendance = () => {
    try {
      const hasAttendanceMarked = students.some(student => student.present || student.absent);
      
      if (!hasAttendanceMarked) {
        toast.error("Marque pelo menos uma presença ou falta antes de salvar.");
        return;
      }

      const newRecord: AttendanceRecord = {
        date: selectedDate,
        period: selectedPeriod,
        students: [...students],
      };

      const existingRecord = attendanceHistory.find(
        record => record.date === selectedDate && record.period === selectedPeriod
      );

      if (existingRecord) {
        toast.warning("Já existe uma chamada registrada para esta data e período.");
        return;
      }

      setAttendanceHistory(prev => [...prev, newRecord]);
      
      setStudents(mockStudents.map(student => ({ ...student, present: false, absent: false })));
      
      toast.success("Presenças salvas com sucesso!", {
        description: `${format(new Date(selectedDate), "dd/MM/yyyy")} - ${selectedPeriod}`,
      });
    } catch (error) {
      toast.error("Erro ao salvar presenças. Tente novamente.");
    }
  };

  const startEditing = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setSelectedDate(record.date);
    setSelectedPeriod(record.period);
  };

  const cancelEditing = () => {
    setEditingRecord(null);
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedPeriod(periods[0]);
    setStudents(mockStudents.map(student => ({ ...student, present: false, absent: false })));
  };

  const saveEditedAttendance = () => {
    try {
      if (!editingRecord) return;

      const hasAttendanceMarked = editingRecord.students.some(
        student => student.present || student.absent
      );
      
      if (!hasAttendanceMarked) {
        toast.error("Marque pelo menos uma presença ou falta antes de salvar.");
        return;
      }

      setAttendanceHistory(prev => 
        prev.map(record => 
          record.date === editingRecord.date && record.period === editingRecord.period
            ? editingRecord
            : record
        )
      );

      toast.success("Registro atualizado com sucesso!", {
        description: `${format(new Date(editingRecord.date), "dd/MM/yyyy")} - ${editingRecord.period}`,
      });

      cancelEditing();
    } catch (error) {
      toast.error("Erro ao atualizar registro. Tente novamente.");
    }
  };

  const deleteRecord = (recordToDelete: AttendanceRecord) => {
    try {
      setAttendanceHistory(prev => 
        prev.filter(record => 
          !(record.date === recordToDelete.date && record.period === recordToDelete.period)
        )
      );
      
      toast.success("Registro removido com sucesso!", {
        description: `${format(new Date(recordToDelete.date), "dd/MM/yyyy")} - ${recordToDelete.period}`,
      });
      setRecordToDelete(null);
    } catch (error) {
      toast.error("Erro ao remover registro. Tente novamente.");
    }
  };

  return (
    <>
      <div className="bg-white flex flex-row justify-center w-full mt-16">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <SidebarSection />
          
          <div className="flex flex-col lg:ml-[283px] p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">Controle de Presença</h1>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2 border w-full sm:w-auto">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-none outline-none w-full"
                />
              </div>
              
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white rounded-lg shadow-sm p-2 border w-full sm:w-auto sm:flex-1 sm:max-w-xs"
              >
                {periods.map((period) => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-base sm:text-lg font-semibold">
                  Chamada - {format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </h2>
                <span className="text-gray-600">{selectedPeriod}</span>
              </div>

              <div className="min-w-[600px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4">Aluno</th>
                      <th className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          Presente
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllPresent}
                            className="text-green-600 hover:text-green-700 h-6 px-2"
                          >
                            Marcar Todos
                          </Button>
                        </div>
                      </th>
                      <th className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          Ausente
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAbsent}
                            className="text-red-600 hover:text-red-700 h-6 px-2"
                          >
                            Marcar Todos
                          </Button>
                        </div>
                      </th>
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
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
                {editingRecord ? (
                  <>
                    <Button 
                      onClick={cancelEditing}
                      variant="outline" 
                      className="text-gray-600 w-full sm:w-auto"
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={saveEditedAttendance}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={saveAttendance} 
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    Salvar Presenças
                  </Button>
                )}
              </div>
            </div>

            {attendanceHistory.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Histórico de Chamadas</h2>
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <div className="space-y-4">
                    {attendanceHistory.map((record, index) => (
                      <div key={index} className="border-b last:border-0 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="font-medium">
                              {format(new Date(record.date), "dd/MM/yyyy")}
                            </span>
                            <span className="text-gray-600">{record.period}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(record)}
                              className="text-blue-600 hover:text-blue-700 flex-1 sm:flex-none"
                              disabled={!!editingRecord}
                            >
                              <PencilIcon className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRecordToDelete(record)}
                              className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                              disabled={!!editingRecord}
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Remover
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 flex gap-4 flex-wrap">
                          <span>Presentes: {record.students.filter(s => s.present).length}</span>
                          <span>Ausentes: {record.students.filter(s => s.absent).length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => recordToDelete && deleteRecord(recordToDelete)}
        title="Remover Registro"
        description={
          recordToDelete
            ? `Tem certeza que deseja remover o registro de ${format(
                new Date(recordToDelete.date),
                "dd/MM/yyyy"
              )} - ${recordToDelete.period}? Esta ação não pode ser desfeita.`
            : ""
        }
      />
    </>
  );
};
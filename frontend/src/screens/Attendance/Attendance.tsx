import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../components/ui/button";
import { useAtendimento } from "./hooks/useAtendimento";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Checkbox } from "../../components/ui/checkbox";
import { CalendarIcon, PencilIcon, SaveIcon, XIcon, TrashIcon, EyeIcon } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "../../components/modals/shared/DeleteConfirmationModal";
import { AttendanceModal } from "../../components/modals/attendance/AttendanceModal";
import { ObservationModal } from "../../components/modals/attendance/ObservationModal";
import { presencaService } from "../../services/presencaService";
import { studentsService } from "../../services/students";

interface Student {
  id: number;
  name: string;
  present: boolean;
  absent: boolean;
  presencaId?: number | null; // id do registro de presença quando existir
  observacao?: string; // observação por Assistido
}

interface AttendanceRecord {
  date: string;
  idAtividade: number | string;
  atividadeTitle?: string;
  students: Student[];
  presencaIds?: number[]; // lista de presencas associadas ao registro
}

export const Attendance = (): JSX.Element => {
  const { 
    selectedDate,
    setSelectedDate,
    atividades,
    selectedAtividadeId,
    setSelectedAtividadeId,
    students,
    setStudents,
    editingRecord,
    setEditingRecord,
    loading,
    loadPresencas,
    loadStudents,
    handleAttendance,
    savePresencas,
    loadAtividades,
    markAllPresent,
    markAllAbsent
  } = useAtendimento();
  
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  // modal context para visualizar presenças de um registro específico
  const [modalAtividadeId, setModalAtividadeId] = useState<number | string | "">(""); 
  const [modalDate, setModalDate] = useState<string | undefined>(undefined);

  // observação modal states (apenas per-Assistido)
  const [observationModalOpen, setObservationModalOpen] = useState(false);
  // per-student observation editor
  const [observationTargetStudentId, setObservationTargetStudentId] = useState<number | null>(null);
  const [observationInitial, setObservationInitial] = useState<string>("");

  useEffect(() => {
    loadAtividades();
    loadStudents();
  }, []);

  // Carregar histórico sempre que mudar a data ou a atividade
  useEffect(() => {
    if (selectedAtividadeId) {
      // Atualiza os estados e carrega os dados
      loadAtividades();
      loadPresencas();
    }
  }, [selectedAtividadeId, selectedDate]);

  // Atualizar histórico baseado APENAS nos dados do backend (presencaId indica que veio do backend)
  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedAtividadeId) {
        setAttendanceHistory([]);
        return;
      }

      try {
        // Busca as presenças diretamente do backend para a data selecionada
        const res = await presencaService.listByAtividade(selectedAtividadeId, {
          dataInicio: selectedDate,
          dataFim: selectedDate
        });

        const presencas = res.presencas || [];
        
        // Filtra apenas as presenças da data selecionada
        const presencasDaData = presencas.filter((p: any) => p.dataRegistro === selectedDate);

        if (presencasDaData.length === 0) {
          setAttendanceHistory([]);
          return;
        }

        // Busca informações dos assistidos
        const assistidosRes = await studentsService.list({ limit: 500 });
        const assistidos = assistidosRes.assistidos || [];
        const assistidosMap = new Map(assistidos.map(a => [Number(a.id), a.nome]));

        // Converte as presenças em Students para o histórico
        const studentsFromPresencas: Student[] = presencasDaData.map((p: any) => ({
          id: Number(p.idAssistido),
          name: assistidosMap.get(Number(p.idAssistido)) || `Assistido ${p.idAssistido}`,
          present: p.status === "presente",
          absent: p.status === "falta",
          presencaId: p.id,
          observacao: p.observacao
        }));

        const historyRecord: AttendanceRecord = {
          date: selectedDate,
          idAtividade: selectedAtividadeId,
          atividadeTitle: atividades.find(a => String(a.id) === String(selectedAtividadeId))?.titulo ?? "",
          students: studentsFromPresencas,
          presencaIds: presencasDaData.map((p: any) => p.id)
        };

        setAttendanceHistory([historyRecord]);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        setAttendanceHistory([]);
      }
    };

    if (selectedAtividadeId && selectedDate) {
      loadHistory();
    }
  }, [selectedAtividadeId, selectedDate, atividades]);
  
  // Recarregar histórico após salvar ou deletar
  const reloadHistory = async () => {
    if (!selectedAtividadeId) return;
    
    try {
      const res = await presencaService.listByAtividade(selectedAtividadeId, {
        dataInicio: selectedDate,
        dataFim: selectedDate
      });

      const presencas = res.presencas || [];
      const presencasDaData = presencas.filter((p: any) => p.dataRegistro === selectedDate);

      if (presencasDaData.length === 0) {
        setAttendanceHistory([]);
        return;
      }

      const assistidosRes = await studentsService.list({ limit: 500 });
      const assistidos = assistidosRes.assistidos || [];
      const assistidosMap = new Map(assistidos.map(a => [Number(a.id), a.nome]));

      const studentsFromPresencas: Student[] = presencasDaData.map((p: any) => ({
        id: Number(p.idAssistido),
        name: assistidosMap.get(Number(p.idAssistido)) || `Assistido ${p.idAssistido}`,
        present: p.status === "presente",
        absent: p.status === "falta",
        presencaId: p.id,
        observacao: p.observacao
      }));

      const historyRecord: AttendanceRecord = {
        date: selectedDate,
        idAtividade: selectedAtividadeId,
        atividadeTitle: atividades.find(a => String(a.id) === String(selectedAtividadeId))?.titulo ?? "",
        students: studentsFromPresencas,
        presencaIds: presencasDaData.map((p: any) => p.id)
      };

      setAttendanceHistory([historyRecord]);
    } catch (err) {
      console.error("Erro ao recarregar histórico:", err);
    }
  };

  // inicia edição de um registro do histórico
  const startEditing = (record: AttendanceRecord) => {
    // garante seleção da atividade e data correspondentes e carrega dados existentes
    setSelectedAtividadeId(record.idAtividade);
    setSelectedDate(record.date);
    
    // copia e normaliza flags present/absent para evitar valores indefinidos
    const studentsCopy = record.students.map((s) => ({
      ...s,
      present: !!s.present,
      absent: !!s.absent
    }));
    setEditingRecord({ ...record, students: studentsCopy });
    
    // Atualiza o estado principal de students para refletir o registro em edição
    setStudents(prevStudents => 
      prevStudents.map(student => {
        const recordStudent = studentsCopy.find(s => s.id === student.id);
        if (recordStudent) {
          return recordStudent;
        }
        return { ...student, present: false, absent: false };
      })
    );
  };

  // cancela edição - limpa estado e recarrega dados do backend
  const cancelEditing = async () => {
    setEditingRecord(null);
    // Recarrega os dados do backend para restaurar o estado real
    await loadPresencas();
  };

  // observação modal handlers: confirma observação apenas por assistido
  const handleObservationConfirm = async (observacao: string) => {
    setObservationModalOpen(false);
    if (observationTargetStudentId !== null) {
      if (editingRecord) {
        setEditingRecord({
          ...editingRecord,
          students: editingRecord.students.map(s =>
            s.id === observationTargetStudentId ? { ...s, observacao } : s
          )
        });
      } else {
        setStudents(prev => prev.map(s => s.id === observationTargetStudentId ? { ...s, observacao } : s));
      }
      setObservationTargetStudentId(null);
      setObservationInitial("");
    }
    // se não houver target, nada a fazer (modal não é usado para salvar global)
  };

  // salva sem abrir modal de observação (modal é apenas per-assistido)
  const promptObservationAndSave = async () => {
    try {
      await savePresencas();
      await reloadHistory();
      // O loadPresencas será chamado automaticamente pelo useEffect quando salvar
    } catch (err) {
      console.error("Erro ao salvar presenças:", err);
      toast.error("Erro ao salvar presenças. Tente novamente.");
    }
  };

  const promptObservationAndSaveEdit = async () => {
    await performSaveEditedAttendance();
  };

  const performSaveEditedAttendance = async () => {
    if (!editingRecord) return;
    try {
      // Sincroniza editingRecord.students para o estado principal
      setStudents(prevStudents => 
        prevStudents.map(student => {
          const editedStudent = editingRecord.students.find(s => s.id === student.id);
          return editedStudent || student;
        })
      );
      
      // Atualiza data e atividade
      setSelectedDate(editingRecord.date);
      setSelectedAtividadeId(editingRecord.idAtividade);
      
      // Limpa o modo de edição ANTES de salvar
      setEditingRecord(null);
      
      // Espera o React processar as atualizações de estado
      setTimeout(async () => {
        try {
          await savePresencas();
          await reloadHistory();
          toast.success("Registro atualizado com sucesso!");
        } catch (err) {
          console.error(err);
          toast.error("Erro ao atualizar registro. Tente novamente.");
        }
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar registro. Tente novamente.");
    }
  };

  const deleteRecord = async (record: AttendanceRecord) => {
    try {
      // apaga todos os ids conhecidos
      if (record.presencaIds && record.presencaIds.length > 0) {
        await Promise.all(record.presencaIds.map(id => presencaService.delete(id)));
      } else {
        // Se não tiver IDs, tenta listar e apagar pela data e atividade
        const listRes = await presencaService.listByAtividade(record.idAtividade, { 
          dataInicio: record.date, 
          dataFim: record.date 
        });
        const presencas = Array.isArray(listRes) ? listRes : (listRes && listRes.presencas) ? listRes.presencas : [];
        if (presencas.length) {
          await Promise.all(presencas.map((p: any) => presencaService.delete(p.id)));
        }
      }

      toast.success("Registro removido com sucesso!", {
        description: `${format(parseISO(record.date), "dd/MM/yyyy")} - ${record.atividadeTitle ?? ""}`
      });

      setRecordToDelete(null);
      // Recarregar dados após deletar
      await loadPresencas();
      await reloadHistory();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover registro. Tente novamente.");
    }
  };

  const openStudentObservation = (studentId: number, initial = "") => {
    setObservationTargetStudentId(studentId);
    setObservationInitial(initial);
    setObservationModalOpen(true);
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
                value={selectedAtividadeId}
                onChange={(e) => setSelectedAtividadeId(e.target.value)}
                className="bg-white rounded-lg shadow-sm p-2 border w-full sm:w-auto sm:flex-1 sm:max-w-xs"
              >
                <option value="">Selecione uma Atividade</option>
                {atividades.map((a) => (
                  <option key={String(a.id)} value={String(a.id)}>
                    {a.titulo ?? `Atividade ${a.id}`}
                  </option>
                ))}
              </select>

              {/* botão "Ver Presenças" movido para o Histórico abaixo (ao lado esquerdo do Editar) */}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto relative">
              {loading && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70">
                  <div className="text-center text-gray-700">Carregando...</div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-base sm:text-lg font-semibold">
                  Chamada - {format(parseISO(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </h2>
                <span className="text-gray-600">{atividades.find(a => String(a.id) === String(selectedAtividadeId))?.titulo ?? ""}</span>
              </div>

              <div className="min-w-[600px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4">Assistido</th>
                      <th className="text-left py-4">Obs</th>
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
                    {(editingRecord ? editingRecord.students : students).map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="py-4">{student.name}</td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStudentObservation(student.id, student.observacao ?? "")}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            {student.observacao ? "Editar" : "Adicionar"}
                          </Button>
                        </td>
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
                      onClick={promptObservationAndSaveEdit}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={promptObservationAndSave} 
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
                              {format(parseISO(record.date), "dd/MM/yyyy")}
                            </span>
                            <span className="text-gray-600">{record.atividadeTitle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setModalAtividadeId(record.idAtividade);
                                setModalDate(record.date);
                                setAttendanceModalOpen(true);
                              }}
                              className="text-green-600 hover:text-green-700 flex-1 sm:flex-none"
                              disabled={!!editingRecord}
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              Ver lista
                            </Button>
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

      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => {
          setAttendanceModalOpen(false);
          setModalAtividadeId("");
          setModalDate(undefined);
        }}
        idAtividade={modalAtividadeId}
        date={modalDate}
      />

      <ObservationModal
        isOpen={observationModalOpen}
        initial={observationInitial}
        onClose={() => {
          setObservationModalOpen(false);
          setObservationTargetStudentId(null);
          setObservationInitial("");
        }}
        onConfirm={handleObservationConfirm}
        title="Observação"
      />

      <DeleteConfirmationModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => recordToDelete && deleteRecord(recordToDelete)}
        title="Remover Registro"
        description={
          recordToDelete
            ? `Tem certeza que deseja remover o registro de ${format(
                parseISO(recordToDelete.date),
                "dd/MM/yyyy"
              )} - ${recordToDelete.atividadeTitle ?? ""}? Esta ação não pode ser desfeita.`
            : ""
        }
      />
    </>
  );
};
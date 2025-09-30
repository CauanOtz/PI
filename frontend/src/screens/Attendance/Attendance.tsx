import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../components/ui/button";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Checkbox } from "../../components/ui/checkbox";
import { CalendarIcon, PencilIcon, SaveIcon, XIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "../../components/modals/shared/DeleteConfirmationModal";
import { AttendanceModal } from "../../components/modals/attendance/AttendanceModal";
import { ObservationModal } from "../../components/modals/attendance/ObservationModal";
import { presencaService } from "../../services/presencaService";
import { studentsService } from "../../services/students";
// se tiver serviço de aulas, importe-o; se não, crie similar ao studentsService
import { http } from "../../lib/http";

interface Student {
  id: number;
  name: string;
  present: boolean;
  absent: boolean;
  presencaId?: number | null; // id do registro de presença quando existir
  observacao?: string; // observação por aluno
}

interface AttendanceRecord {
  date: string;
  idAula: number | string;
  aulaTitle?: string;
  students: Student[];
  presencaIds?: number[]; // lista de presencas associadas ao registro
}

interface Aula {
  id: number | string;
  titulo?: string;
  data?: string;
}

export const Attendance = (): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [selectedAulaId, setSelectedAulaId] = useState<number | string | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  // modal context para visualizar presenças de um registro específico
  const [modalAulaId, setModalAulaId] = useState<number | string | "">("");
  const [modalDate, setModalDate] = useState<string | undefined>(undefined);

  // observação modal states (apenas per-aluno)
  const [observationModalOpen, setObservationModalOpen] = useState(false);
  // per-student observation editor
  const [observationTargetStudentId, setObservationTargetStudentId] = useState<number | null>(null);
  const [observationInitial, setObservationInitial] = useState<string>("");

  const loadAulas = async () => {
    try {
      const res = await http.get("/aulas"); // ajuste URL se necessário
      const data = res.data;
      setAulas(Array.isArray(data) ? data : (data && data.aulas) ? data.aulas : []);
      if (Array.isArray(data) && data.length > 0 && !selectedAulaId) {
        setSelectedAulaId(data[0].id);
      }
    } catch (err) {
      console.warn("Não foi possível carregar aulas:", err);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await studentsService.list({ limit: 500 });
      const payload = res as any;
      const alunos = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.alunos)
        ? payload.alunos
        : Array.isArray(payload.data)
        ? payload.data
        : [];

      const mapped: Student[] = (alunos as any[]).map((a: any) => ({
        id: Number(a.id),
        name: a.nome ?? a.nome_completo ?? a.nome_aluno ?? String(a.id),
        present: false,
        absent: false,
        presencaId: null
      }));
      setStudents(mapped);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
      setStudents([]);
    }
  };

  useEffect(() => {
    loadAulas();
    loadStudents();
  }, []);

  // carga histórico para aula/data selecionada
  const loadHistory = async () => {
    if (!selectedAulaId) {
      setAttendanceHistory([]);
      return;
    }
    try {
      setLoading(true);
      // busca presencas para a aula na data selecionada
      const res = await presencaService.list({ idAula: selectedAulaId, dataInicio: selectedDate, dataFim: selectedDate });
      const presencas = Array.isArray(res) ? res : (res && res.presencas) ? res.presencas : [];
      if (presencas.length === 0) {
        setAttendanceHistory([]);
        return;
      }
      // agrupa por data (deve ser apenas selectedDate)
      const studentsMap: Record<number, Student> = {};
      students.forEach(s => { studentsMap[s.id] = { ...s }; });

      presencas.forEach((p: any) => {
        const idAluno = Number(p.idAluno ?? p.id_aluno ?? (p.aluno && p.aluno.id));
        const status = p.status;
        if (!studentsMap[idAluno]) {
          studentsMap[idAluno] = {
            id: idAluno,
            name: p.aluno?.nome ?? String(idAluno),
            present: false,
            absent: false,
            presencaId: null
          };
        }
        studentsMap[idAluno].present = status === "presente";
        studentsMap[idAluno].absent = status === "falta";
        studentsMap[idAluno].presencaId = p.id;
      });

      const studentsList = Object.values(studentsMap);
      const aulaTitle = (aulas.find(a => String(a.id) === String(selectedAulaId))?.titulo) ?? "";

      const record: AttendanceRecord = {
        date: selectedDate,
        idAula: selectedAulaId,
        aulaTitle,
        students: studentsList,
        presencaIds: presencas.map((p: any) => p.id)
      };

      setAttendanceHistory([record]);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setAttendanceHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // recarregar histórico sempre que mudar aula ou data
    if (selectedAulaId) loadHistory();
  }, [selectedAulaId, selectedDate, students]);

  // inicia edição de um registro do histórico
  const startEditing = (record: AttendanceRecord) => {
    // garante seleção da aula e data correspondentes
    setSelectedAulaId(record.idAula);
    setSelectedDate(record.date);
    // copia e normaliza flags present/absent para evitar valores indefinidos
    const studentsCopy = record.students.map((s) => ({
      ...s,
      present: !!s.present,
      absent: !!s.absent
    }));
    setEditingRecord({ ...record, students: studentsCopy });
  };

  // cancela edição - limpa estado e reseta marcações locais
  const cancelEditing = () => {
    setEditingRecord(null);
    // reseta marcações na lista principal de alunos
    setStudents((prev) => prev.map((s) => ({ ...s, present: false, absent: false })));
  };

  const handleAttendance = (studentId: number, type: 'present' | 'absent') => {
    const target = editingRecord ? editingRecord.students : students;
    const updated = target.map(s => s.id === studentId ? {
      ...s,
      present: type === 'present' ? !s.present : false,
      absent: type === 'absent' ? !s.absent : false
    } : s);

    if (editingRecord) setEditingRecord({ ...editingRecord, students: updated });
    else setStudents(updated);
  };

  const markAllPresent = () => {
    const target = editingRecord ? editingRecord.students : students;
    const updated = target.map(s => ({ ...s, present: true, absent: false }));
    if (editingRecord) setEditingRecord({ ...editingRecord, students: updated });
    else setStudents(updated);
    toast.success("Todos os alunos marcados como presentes");
  };

  const markAllAbsent = () => {
    const target = editingRecord ? editingRecord.students : students;
    const updated = target.map(s => ({ ...s, present: false, absent: true }));
    if (editingRecord) setEditingRecord({ ...editingRecord, students: updated });
    else setStudents(updated);
    toast.success("Todos os alunos marcados como ausentes");
  };

  // salva presenças: cria presenca por aluno marcado (parallel)
  // Previously had a separate saveAttendance; logic unified into performSaveAttendance

  // observação modal handlers: confirma observação apenas por aluno
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

  // salva sem abrir modal de observação (modal é apenas per-aluno)
  const promptObservationAndSave = async () => {
    await performSaveAttendance();
  };

  const promptObservationAndSaveEdit = async () => {
    await performSaveEditedAttendance();
  };

  const performSaveAttendance = async (_observacao?: string) => {
    if (!selectedAulaId) {
      toast.error("Selecione uma aula antes de salvar.");
      return;
    }
    try {
      const target = students;
      const marked = target.filter(s => s.present || s.absent);
      if (marked.length === 0) {
        toast.error("Marque pelo menos uma presença ou falta antes de salvar.");
        return;
      }
      setLoading(true);

      const listRes = await presencaService.list({ idAula: selectedAulaId, dataInicio: selectedDate, dataFim: selectedDate });
      const existingPresencas = Array.isArray(listRes) ? listRes : (listRes && listRes.presencas) ? listRes.presencas : [];
      const existingByAluno = new Map<number, any>();
      existingPresencas.forEach((p: any) => {
        const idAluno = Number(p.idAluno ?? p.id_aluno ?? (p.aluno && p.aluno.id));
        if (idAluno) existingByAluno.set(idAluno, p);
      });

      const toCreate = marked.filter(s => !existingByAluno.has(s.id));
      const toUpdate = marked.filter(s => existingByAluno.has(s.id));

      // primeiro atualiza os que já existem
      await Promise.all(toUpdate.map(s => {
        const pres = existingByAluno.get(s.id);
        if (!pres) return Promise.resolve(null);
        return presencaService.update(pres.id, {
          status: s.present ? "presente" : "falta",
          data_registro: selectedDate,
          observacao: s.observacao ?? undefined
        });
      }));

      // depois cria todos os novos em uma única requisição (previne race/unique errors)
      if (toCreate.length > 0) {
        const payload = toCreate.map(s => ({
          idAluno: s.id,
          idAula: selectedAulaId,
          status: (s.present ? "presente" : "falta") as
            | "presente"
            | "falta"
            | "atraso"
            | "falta_justificada",
          data_registro: selectedDate,
          observacao: s.observacao ?? undefined
        }));
        await presencaService.bulkCreate(payload);
      }

      toast.success("Presenças salvas com sucesso!", {
        description: `${format(parseISO(selectedDate), "dd/MM/yyyy")} - ${aulas.find(a => String(a.id) === String(selectedAulaId))?.titulo ?? ""}`
      });

      setStudents(prev => prev.map(p => ({ ...p, present: false, absent: false, presencaId: null })));
      await loadHistory();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar presenças. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const performSaveEditedAttendance = async (_observacao?: string) => {
    if (!editingRecord) return;
    try {
      const { students: edStudents, presencaIds } = editingRecord;
      setLoading(true);
      if (presencaIds && presencaIds.length > 0) {
        await Promise.all(presencaIds.map((id) => presencaService.delete(id)));
      } else {
        const listRes = await presencaService.list({ idAula: editingRecord.idAula, dataInicio: editingRecord.date, dataFim: editingRecord.date });
        const presencas = Array.isArray(listRes) ? listRes : (listRes && listRes.presencas) ? listRes.presencas : [];
        if (presencas.length) {
          await Promise.all(presencas.map((p: any) => presencaService.delete(p.id)));
        }
      }

      const toCreate = edStudents.filter(s => s.present || s.absent);
      await Promise.all(toCreate.map(s => presencaService.create({
        idAluno: s.id,
        idAula: editingRecord.idAula,
        status: s.present ? "presente" : "falta",
        data_registro: editingRecord.date,
  observacao: s.observacao ?? _observacao ?? undefined
      })));

      toast.success("Registro atualizado com sucesso!", {
        description: `${format(parseISO(editingRecord.date), "dd/MM/yyyy")} - ${editingRecord.aulaTitle ?? ""}`
      });

      setEditingRecord(null);
      await loadHistory();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar registro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (record: AttendanceRecord) => {
    try {
      setLoading(true);
      // apaga todos os ids conhecidos; se não tiver ids, tenta listar e apagar
      if (record.presencaIds && record.presencaIds.length > 0) {
        await Promise.all(record.presencaIds.map(id => presencaService.delete(id)));
      } else {
        const listRes = await presencaService.list({ idAula: record.idAula, dataInicio: record.date, dataFim: record.date });
        const presencas = Array.isArray(listRes) ? listRes : (listRes && listRes.presencas) ? listRes.presencas : [];
        if (presencas.length) {
          await Promise.all(presencas.map((p: any) => presencaService.delete(p.id)));
        }
      }

      toast.success("Registro removido com sucesso!", {
        description: `${format(parseISO(record.date), "dd/MM/yyyy")} - ${record.aulaTitle ?? ""}`
      });

      setRecordToDelete(null);
      await loadHistory();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover registro. Tente novamente.");
    } finally {
      setLoading(false);
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
                value={selectedAulaId}
                onChange={(e) => setSelectedAulaId(e.target.value)}
                className="bg-white rounded-lg shadow-sm p-2 border w-full sm:w-auto sm:flex-1 sm:max-w-xs"
              >
                <option value="">Selecione uma Aula</option>
                {aulas.map((a) => (
                  <option key={String(a.id)} value={String(a.id)}>
                    {a.titulo ?? `Aula ${a.id}`}
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
                <span className="text-gray-600">{aulas.find(a => String(a.id) === String(selectedAulaId))?.titulo ?? ""}</span>
              </div>

              <div className="min-w-[600px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4">Aluno</th>
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
                            <span className="text-gray-600">{record.aulaTitle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setModalAulaId(record.idAula);
                                setModalDate(record.date);
                                setAttendanceModalOpen(true);
                              }}
                              className="text-gray-700 hover:text-gray-900 flex-1 sm:flex-none"
                              disabled={!!editingRecord}
                            >
                              Ver
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
          setModalAulaId("");
          setModalDate(undefined);
        }}
        idAula={modalAulaId}
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
              )} - ${recordToDelete.aulaTitle ?? ""}? Esta ação não pode ser desfeita.`
            : ""
        }
      />
    </>
  );
};
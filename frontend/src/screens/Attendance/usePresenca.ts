import { useState } from 'react';
import { Student } from './types';
import { presencaService } from '../../services/presencaService';

export function usePresenca() {
  const [loading, setLoading] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<Array<{
    date: string;
    idAtividade: number | string;
    atividadeTitle?: string;
    students: Student[];
    presencaIds?: number[];
  }>>([]);

  const loadHistory = async (selectedAtividadeId: string | number, selectedDate: string, students: Student[]) => {
    if (!selectedAtividadeId) {
      setAttendanceHistory([]);
      return;
    }

    try {
      setLoading(true);
      const res = await presencaService.listByAtividade(selectedAtividadeId, { dataInicio: selectedDate, dataFim: selectedDate });
      const presencas = res.presencas;
      const atividadeTitle = res.atividade?.titulo;

      if (presencas.length === 0) {
        setAttendanceHistory([]);
        return;
      }

      // Mapeia os alunos presentes a partir dos dados do backend
      const studentsMap = new Map<number, Student>();
      
      presencas.forEach((p) => {
        const idAssistido = Number(p.idAssistido ?? (p.assistido && p.assistido.id));
        const assistidoNome = p.assistido?.nome ?? String(idAssistido);
        if (idAssistido) {
          studentsMap.set(idAssistido, {
            id: idAssistido,
            name: assistidoNome,
            present: p.status === "presente",
            absent: p.status === "falta",
            presencaId: p.id,
            observacao: p.observacao
          });
        }
      });
      
      // Adiciona alunos que não têm presença registrada
      students.forEach(s => {
        if (!studentsMap.has(s.id)) {
          studentsMap.set(s.id, {
            ...s,
            present: false,
            absent: false,
            presencaId: null
          });
        }
      });
      
      const studentsList = Array.from(studentsMap.values());

      const record = {
        date: selectedDate,
        idAtividade: selectedAtividadeId,
        atividadeTitle,
        students: studentsList,
        presencaIds: presencas.map(p => p.id)
      };

      setAttendanceHistory([record]);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setAttendanceHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    attendanceHistory,
    loadHistory
  };
}
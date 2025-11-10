import { presencaService } from "../../services/presencaService";
import { Student } from "./types";

export async function loadHistoryData(selectedAtividadeId: string | number, selectedDate: string, students: Student[]) {
  const res = await presencaService.listByAtividade(selectedAtividadeId, { dataInicio: selectedDate, dataFim: selectedDate });
  const presencas = res.presencas;
  
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
  
  return Array.from(studentsMap.values());
}
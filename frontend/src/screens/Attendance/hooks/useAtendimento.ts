// hooks/useAtendimento.ts
import { useState, useCallback } from 'react';
import { Student } from '../types';
import { format } from 'date-fns';
import { presencaService } from '../../../services/presencaService';
import { studentsService } from '../../../services/students';
import { http } from '../../../lib/http';
import { toast } from 'sonner';

interface Atividade {
  id: number | string;
  titulo?: string;
  data?: string;
}

export function useAtendimento() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [selectedAtividadeId, setSelectedAtividadeId] = useState<number | string | "">("");
  const [students, setStudents] = useState<Student[]>([]);
  const [editingRecord, setEditingRecord] = useState<{
    date: string;
    idAtividade: number | string;
    atividadeTitle?: string;
    students: Student[];
    presencaIds?: number[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAtividades = useCallback(async () => {
    try {
      const res = await http.get<{ sucesso: boolean; dados: { atividades: Atividade[] } }>("/atividades");
      const atividades = res.data.dados.atividades;
      setAtividades(atividades);
      if (atividades.length > 0 && !selectedAtividadeId) {
        setSelectedAtividadeId(atividades[0].id);
      }
    } catch (err) {
      console.warn("Não foi possível carregar atividades:", err);
      toast.error("Não foi possível carregar atividades");
    }
  }, [selectedAtividadeId]);

  const loadStudents = useCallback(async () => {
    try {
      const res = await studentsService.list({ limit: 500 });
      const assistidos = res.assistidos || [];

      const mapped: Student[] = assistidos.map((assistido) => ({
        id: Number(assistido.id),
        name: assistido.nome,
        present: false,
        absent: false,
        presencaId: null
      }));
      setStudents(mapped);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
      setStudents([]);
    }
  }, []);

  const loadPresencas = useCallback(async () => {
    if (!selectedAtividadeId) return;

    try {
      setLoading(true);
      console.log("Carregando presenças para atividade:", selectedAtividadeId, "data:", selectedDate);
      const res = await presencaService.listByAtividade(selectedAtividadeId, { dataInicio: selectedDate, dataFim: selectedDate });
      const presencas = res.presencas || [];
      console.log("Presenças retornadas do backend:", presencas);

      // Atualiza o estado dos alunos com as presenças
      setStudents(prevStudents => {
        // Cria um mapa de alunos a partir do estado anterior
        const studentsMap: Record<number, Student> = {};
        prevStudents.forEach(s => { 
          studentsMap[s.id] = { ...s, present: false, absent: false, presencaId: null, observacao: undefined }; 
        });

        // Atualiza o mapa com as presenças encontradas
        presencas.forEach((p: any) => {
          const idAssistido = Number(p.idAssistido);
          const status = p.status;
          if (!studentsMap[idAssistido]) {
            studentsMap[idAssistido] = {
              id: idAssistido,
              name: p.assistido?.nome ?? String(idAssistido),
              present: false,
              absent: false,
              presencaId: null
            };
          }
          studentsMap[idAssistido].present = status === "presente";
          studentsMap[idAssistido].absent = status === "falta";
          studentsMap[idAssistido].presencaId = p.id;
          studentsMap[idAssistido].observacao = p.observacao;
        });

        // Atualiza o estado com todos os alunos (com ou sem presença registrada)
        const updatedStudents = Object.values(studentsMap);
        console.log("Estado de assistidos atualizado:", updatedStudents);
        return updatedStudents;
      });
    } catch (err) {
      console.error("Erro ao carregar presenças:", err);
      toast.error("Erro ao carregar presenças");
    } finally {
      setLoading(false);
    }
  }, [selectedAtividadeId, selectedDate]);

  const savePresencas = useCallback(async () => {
    if (!selectedAtividadeId) {
      toast.error("Selecione uma atividade antes de salvar.");
      return;
    }

    try {
      const marked = students.filter(s => s.present || s.absent);
      if (marked.length === 0) {
        toast.error("Marque pelo menos uma presença ou falta antes de salvar.");
        return;
      }
      setLoading(true);

      const listRes = await presencaService.listByAtividade(selectedAtividadeId, { dataInicio: selectedDate, dataFim: selectedDate });
      const existingPresencas = Array.isArray(listRes) ? listRes : (listRes && listRes.presencas) ? listRes.presencas : [];
      
      // IMPORTANTE: Filtra apenas as presenças da data selecionada
      const presencasDaData = existingPresencas.filter((p: any) => p.dataRegistro === selectedDate);
      
      const existingByAssistido = new Map<number, any>();
      presencasDaData.forEach((p: any) => {
        const idAssistido = Number(p.idAssistido);
        if (idAssistido) existingByAssistido.set(idAssistido, p);
      });

      const toCreate = marked.filter(s => !existingByAssistido.has(s.id));
      const toUpdate = marked.filter(s => existingByAssistido.has(s.id));

      console.log("======= SALVANDO PRESENÇAS =======");
      console.log("Total marcados:", marked.length);
      console.log("Para criar:", toCreate.length, toCreate.map(s => ({ id: s.id, name: s.name, present: s.present, absent: s.absent })));
      console.log("Para atualizar:", toUpdate.length, toUpdate.map(s => ({ id: s.id, name: s.name, present: s.present, absent: s.absent })));

      // primeiro atualiza os que já existem
      const updateResults = await Promise.all(toUpdate.map(async s => {
        const pres = existingByAssistido.get(s.id);
        if (!pres) return Promise.resolve(null);
        
        // Atualiza apenas o status e observação
        // NÃO enviamos data_registro porque estamos sempre trabalhando com presenças
        // que já estão na data correta (filtradas por selectedDate)
        const updateData = {
          status: (s.present ? "presente" : "falta") as "presente" | "falta" | "atraso" | "falta_justificada",
          observacao: s.observacao ?? undefined
        };
        
        console.log(`PUT /presencas/${pres.id}`, updateData);
        const result = await presencaService.update(pres.id, updateData);
        console.log(`Resposta PUT /presencas/${pres.id}:`, result);
        return result;
      }));
      
      console.log("Resultados das atualizações:", updateResults);

      // depois cria todos os novos em uma única requisição (previne race/unique errors)
      if (toCreate.length > 0) {
        const payload = toCreate.map(s => ({
          idAssistido: s.id,
          idAtividade: selectedAtividadeId,
          status: (s.present ? "presente" : "falta") as
            | "presente"
            | "falta"
            | "atraso"
            | "falta_justificada",
          data_registro: selectedDate,
          observacao: s.observacao ?? undefined
        }));
        console.log("=== PAYLOAD BULK CREATE ===");
        console.log("POST /presencas/bulk", JSON.stringify(payload, null, 2));
        const createResult = await presencaService.bulkCreate(payload);
        console.log("Resposta POST /presencas/bulk:", createResult);
      }

      console.log("======= FIM SALVAMENTO =======");
      toast.success("Presenças salvas com sucesso!");

      console.log("Antes de recarregar presenças...");
      await loadPresencas();
      console.log("Presenças recarregadas.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar presenças. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [selectedAtividadeId, selectedDate, students, loadPresencas]);

  const handleAttendance = useCallback((studentId: number, type: 'present' | 'absent') => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? {
        ...s,
        present: type === 'present' ? !s.present : false,
        absent: type === 'absent' ? !s.absent : false
      } : s
    ));
    
    // Também atualiza editingRecord se estiver em modo de edição
    setEditingRecord(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.map(s =>
          s.id === studentId ? {
            ...s,
            present: type === 'present' ? !s.present : false,
            absent: type === 'absent' ? !s.absent : false
          } : s
        )
      };
    });
  }, []);

  const markAllPresent = useCallback(() => {
    setStudents(prev => prev.map(s => ({ ...s, present: true, absent: false })));
    setEditingRecord(prev => {
      if (!prev) return null;
      return { ...prev, students: prev.students.map(s => ({ ...s, present: true, absent: false })) };
    });
    toast.success("Todos os assistidos marcados como presentes");
  }, []);

  const markAllAbsent = useCallback(() => {
    setStudents(prev => prev.map(s => ({ ...s, present: false, absent: true })));
    setEditingRecord(prev => {
      if (!prev) return null;
      return { ...prev, students: prev.students.map(s => ({ ...s, present: false, absent: true })) };
    });
    toast.success("Todos os assistidos marcados como ausentes");
  }, []);

  return {
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
    loadAtividades,
    loadStudents,
    loadPresencas,
    savePresencas,
    handleAttendance,
    markAllPresent,
    markAllAbsent
  };
}
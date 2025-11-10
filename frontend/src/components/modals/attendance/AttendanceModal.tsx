import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../ui/button";
import { toast } from "sonner";
import { presencaService } from "../../../services/presencaService";
import { studentsService } from "../../../services/students";

type ModalPresenca = {
  id: number;
  idAssistido: number;
  status: "presente" | "falta" | "atraso" | "falta_justificada";
  observacao?: string;
  dataRegistro: string;
  assistido?: {
    id: number;
    nome: string;
  };
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idAtividade?: number | string | "";
  date?: string;
}

export const AttendanceModal = ({ isOpen, onClose, idAtividade, date }: Props) => {
  const [loading, setLoading] = useState(false);
  const [presencas, setPresencas] = useState<ModalPresenca[]>([]);
  const [assistidosMap, setAssistidosMap] = useState<Map<number, string>>(new Map());

  const loadAssistidosInfo = async (presencasList: ModalPresenca[]) => {
    try {
      const idsAssistidos = [...new Set(presencasList.map(p => p.idAssistido))];
      const res = await studentsService.list({ limit: 500 });
      const assistidos = res.assistidos || [];
      
      const newMap = new Map<number, string>();
      assistidos.forEach(assistido => {
        if (idsAssistidos.includes(Number(assistido.id))) {
          newMap.set(Number(assistido.id), assistido.nome);
        }
      });
      
      setAssistidosMap(newMap);
    } catch (err) {
      console.error("Erro ao carregar informações dos assistidos:", err);
      toast.error("Erro ao carregar nomes dos assistidos.");
    }
  };

  useEffect(() => {
    if (!isOpen || !date) return;
    const load = async () => {
      if (!idAtividade) {
        setPresencas([]);
        return;
      }
      try {
        setLoading(true);
        const res = await presencaService.listByAtividade(idAtividade, { 
          dataInicio: date,
          dataFim: date
        });
        
        // Filtrando apenas as presenças do dia específico
        const list = res.presencas.filter(p => {
          return p.dataRegistro === date;
        });
        
        setPresencas(list);
        await loadAssistidosInfo(list);
      } catch (err) {
        console.error("Erro ao carregar presenças da atividade:", err);
        toast.error("Erro ao carregar presenças.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, idAtividade, date]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Presenças - {date ? format(new Date(date), "dd/MM/yyyy", { locale: ptBR }) : "Todas as datas"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : presencas.length === 0 ? (
            <div className="text-center py-8 text-gray-600">Nenhuma presença registrada.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Assistido</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Observação</th>
                </tr>
              </thead>
              <tbody>
                {presencas.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{assistidosMap.get(p.idAssistido) || 'Carregando...'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        p.status === "presente" 
                          ? "bg-green-100 text-green-700"
                          : p.status === "falta"
                          ? "bg-red-100 text-red-700"
                          : p.status === "atraso"
                          ? "bg-yellow-100 text-yellow-700"
                          : p.status === "falta_justificada"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {p.status === "presente" 
                          ? "Presente"
                          : p.status === "falta"
                          ? "Ausente"
                          : p.status === "atraso"
                          ? "Atrasado"
                          : p.status === "falta_justificada"
                          ? "Falta Justificada"
                          : "Não registrado"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.observacao 
                        ? <span className="inline-block max-w-xs truncate" title={p.observacao}>{p.observacao}</span>
                        : <span className="text-gray-400">-</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
};
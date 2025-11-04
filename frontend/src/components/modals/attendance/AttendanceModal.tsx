import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../ui/button";
import { toast } from "sonner";
import { presencaService } from "../../../services/presencaService";
import { Aula } from "../../../services/class";

interface Presenca {
  id: number;
  idAluno?: number;
  status?: string;
  observacao?: string;
  data_registro?: string;
  aluno?: { id?: number; nome?: string };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idAula?: number | string | "";
  date?: string;
}

export const AttendanceModal = ({ isOpen, onClose, idAula, date }: Props) => {
  const [loading, setLoading] = useState(false);
  const [presencas, setPresencas] = useState<Presenca[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      if (!idAula) {
        setPresencas([]);
        return;
      }
      try {
        setLoading(true);
        const res = await presencaService.list({ idAula, dataInicio: date, dataFim: date });
        const list = Array.isArray(res) ? res : (res && res.presencas) ? res.presencas : (res && res.presencas === undefined ? res : []);
        setPresencas(list);
      } catch (err) {
        console.error("Erro ao carregar presenças da aula:", err);
        toast.error("Erro ao carregar presenças.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, idAula, date]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Presenças - {date ? format(new Date(date), "dd/MM/yyyy", { locale: ptBR }) : "Todas as datas"}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
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
                  <th className="text-left py-2">Aluno</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Observação</th>
                  <th className="text-left py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {presencas.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.aluno?.nome ?? `#${p.idAluno ?? p.id}`}</td>
                    <td className="py-2">{p.status ?? "-"}</td>
                    <td className="py-2">{p.observacao ?? "-"}</td>
                    <td className="py-2">{p.data_registro ? format(new Date(p.data_registro), "dd/MM/yyyy") : "-"}</td>
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
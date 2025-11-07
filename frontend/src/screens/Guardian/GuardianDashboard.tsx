import { useEffect, useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { BarChart2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { getAssistidosDoResponsavel } from "../../services/responsavel";

export const GuardianDashboard = () => {
  const { user } = useAuth();
  const [assistidos, setAssistidos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssistido, setSelectedAssistido] = useState<any | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendance, setAttendance] = useState<Record<number, { total: number; presente: number; falta: number; atraso: number; falta_justificada: number; lista: any[] }>>({});
  const [showAllPresencas, setShowAllPresencas] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!user) {
        setAssistidos([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getAssistidosDoResponsavel(user.id);
        const arr = Array.isArray(data) ? data : (data?.assistidos ?? []);
        setAssistidos(arr);
      } catch (err: any) {
        console.error("Failed to load assistidos for responsavel", err);
        setError(err?.response?.data?.mensagem ?? "Erro ao carregar dados");
        setAssistidos([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  useEffect(() => {
    if (assistidos && assistidos.length > 0 && !selectedAssistido) {
      setSelectedAssistido(assistidos[0]);
    }
  }, [assistidos, selectedAssistido]);

  useEffect(() => {
    const loadAttendance = async (assistidoId: number) => {
      setAttendanceLoading(true);
      try {
        const data = await (await import('../../services/presencaService')).presencaService.listByAssistido(assistidoId, { limit: 50 });
        // Suportes de formatos possíveis:
        // 1) Array direto
        // 2) { presencas: [...] }
        // 3) { rows: [...] }
        // 4) { historico: [...], aluno: {...} }
        // 5) { dados: { presencas|rows|historico }}
        const resolveArray = (payload: any): any[] => {
          if (!payload) return [];
          if (Array.isArray(payload)) return payload;
          if (Array.isArray(payload.historico)) return payload.historico;
          if (Array.isArray(payload.presencas)) return payload.presencas;
          if (Array.isArray(payload.rows)) return payload.rows;
          if (payload.dados) return resolveArray(payload.dados);
          return [];
        };
        const arrRaw = resolveArray(data);

        // Função segura para extrair a data comparável
        const extractDate = (p: any): number => {
          const dateStr = p?.data_registro || p?.dataRegistro || p?.data || p?.createdAt || p?.updatedAt;
          if (!dateStr) return 0;
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        };

        // Ordena do mais recente para o mais antigo (desc)
        const arr = [...arrRaw].sort((a, b) => extractDate(b) - extractDate(a));

  const stats = { total: 0, presente: 0, falta: 0, atraso: 0, falta_justificada: 0 };
        for (const p of arr) {
          const st = p.status || p.presenca || p.situacao;
          if (st) {
            stats.total++;
            if (st === 'presente') stats.presente++;
            else if (st === 'falta') stats.falta++;
            else if (st === 'atraso') stats.atraso++;
            else if (st === 'falta_justificada') stats.falta_justificada++;
          }
        }

        setAttendance(prev => ({ ...prev, [assistidoId]: { ...stats, lista: arr } }));
      } catch (err) {
        console.error('Erro ao carregar presenças do assistido', err);
  setAttendance(prev => ({ ...prev, [assistidoId]: { total: 0, presente: 0, falta: 0, atraso: 0, falta_justificada: 0, lista: [] } }));
      } finally {
        setAttendanceLoading(false);
      }
    };
    if (selectedAssistido?.id) {
      // só carrega se ainda não tiver
      if (!attendance[selectedAssistido.id]) {
        void loadAttendance(selectedAssistido.id);
      }
    }
  }, [selectedAssistido, attendance]);

  if (loading) {
    return (
      <div className="bg-slate-50 flex min-h-screen">
        <SidebarSection />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-[283px] mt-16 flex items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Carregando informações do assistido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full border-4 border-t-4 border-slate-200 border-t-blue-500 animate-spin" />
              <p className="text-slate-600">Aguarde enquanto carregamos os dados vinculados ao responsável...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 flex min-h-screen">
        <SidebarSection />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-[283px] mt-16 flex items-start justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Erro ao carregar</CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

    if (!assistidos || assistidos.length === 0) {
    return (
      <div className="p-6">
        <SidebarSection />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-[283px] mt-16">
          <h2 className="text-xl font-semibold">Nenhum assistido vinculado</h2>
          <p className="text-slate-600">Você ainda não possui assistidos vinculados a este responsável.</p>
        </main>
      </div>
    );
  }

  const assistido = selectedAssistido ?? assistidos[0];

  return (
    <div className="bg-slate-50 flex min-h-screen">
      <SidebarSection />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-[283px] mt-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Portal do Responsável</h1>
          <p className="text-slate-500 mt-1">Acompanhe a vida escolar de {assistido.nome}.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {assistidos.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAssistido(a)}
                className={`w-full text-left p-3 rounded-md border bg-white hover:bg-slate-50 transition-colors flex items-center gap-3 ${assistido?.id === a.id ? 'ring-2 ring-blue-300' : ''}`}>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={a.avatarUrl ?? ''} alt={a.nome} />
                  <AvatarFallback className="bg-blue-500 text-white">{a.nome ? String(a.nome).charAt(0) : '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-slate-800">{a.nome}</div>
                  <div className="text-sm text-slate-500">{a.turma ?? a.nome_turma ?? '-'}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md">
              <CardHeader className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={assistido.avatarUrl ?? ''} alt={assistido.nome} />
                  <AvatarFallback className="bg-blue-500 text-white">{assistido.nome ? String(assistido.nome).charAt(0) : '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-slate-800">{assistido.nome}</CardTitle>
                  <p className="text-xs text-slate-500">Resumo de presenças</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-6">
                  {(() => {
                    const a = attendance[assistido.id];
                    const total = a?.total || 0;
                    const pct = (v: number) => total ? Math.round((v / total) * 100) : 0;
                    const items = [
                      { label: 'Presenças', value: a?.presente || 0, icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
                      { label: 'Faltas', value: a?.falta || 0, icon: <XCircle className="w-4 h-4 text-red-500" /> },
                    ];
                    return items.map(i => (
                      <div key={i.label} className="p-3 rounded-md border bg-white flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-500">{i.icon} {i.label}</div>
                        <div className="text-slate-800 font-semibold text-lg leading-none">{i.value}</div>
                        <div className="text-[10px] text-slate-400">{pct(i.value)}%</div>
                      </div>
                    ));
                  })()}
                </div>
                <h3 className="font-semibold text-slate-700 mb-2">Informações do Assistido</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Nome:</span> <span className="font-medium">{assistido.nome ?? '-'}</span></div>
                  <div className="flex justify-between"><span>Idade:</span> <span className="font-medium">{assistido.idade ?? '-'}</span></div>
                  <div className="flex justify-between"><span>Contato:</span> <span className="font-medium">{assistido.contato ?? '-'}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-slate-800"><BarChart2 className="w-5 h-5 text-blue-500"/> Registros de Presença</CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {attendance[assistido.id] && (
                    <>
                      <span>Total: <strong className="text-slate-700">{attendance[assistido.id].total}</strong></span>
                      <span className="hidden sm:inline">|</span>
                      <button
                        type="button"
                        onClick={() => setShowAllPresencas(v => !v)}
                        className="px-2 py-1 rounded border text-slate-600 hover:bg-slate-50 transition text-[11px]"
                      >{showAllPresencas ? 'Mostrar recentes' : 'Mostrar todos'}</button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {attendanceLoading && !attendance[assistido.id] && (
                  <p className="text-sm text-slate-500">Carregando presenças...</p>
                )}
                {!attendanceLoading && attendance[assistido.id] && attendance[assistido.id].lista.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhum registro de presença.</p>
                )}
                {attendance[assistido.id] && attendance[assistido.id].lista.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 border-b">
                          <th className="py-2 pr-2 font-medium">Data</th>
                          <th className="py-2 pr-2 font-medium">Aula</th>
                          <th className="py-2 pr-2 font-medium">Status</th>
                          <th className="py-2 pr-2 font-medium">Observação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllPresencas ? attendance[assistido.id].lista : attendance[assistido.id].lista.slice(0, 8)).map((p: any, idx: number) => {
                          const status = p.status || p.presenca || p.situacao;
                          const dateStr = p.data_registro || p.dataRegistro || p.data || p.createdAt;
                          const d = dateStr ? new Date(dateStr) : null;
                          const labelDate = d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--';
                          const statusColor = status === 'presente' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : status === 'falta' ? 'bg-red-100 text-red-700 border-red-200' : status === 'atraso' ? 'bg-amber-100 text-amber-700 border-amber-200' : status === 'falta_justificada' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200';
                          const aulaTitulo = p.aula?.titulo || p.aula?.nome || p.titulo_aula || '-';
                          const obs = p.observacao || p.obs || '';
                          return (
                            <tr key={idx} className="border-b last:border-none">
                              <td className="py-2 pr-2 whitespace-nowrap text-slate-700">{labelDate}</td>
                              <td className="py-2 pr-2 max-w-[160px] truncate text-slate-600" title={aulaTitulo}>{aulaTitulo}</td>
                              <td className="py-2 pr-2">
                                <span className={`inline-block px-2 py-0.5 rounded border text-[11px] capitalize ${statusColor}`}>{status || '—'}</span>
                              </td>
                              <td className="py-2 pr-2 max-w-[180px] truncate text-slate-500" title={obs}>{obs || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuardianDashboard;

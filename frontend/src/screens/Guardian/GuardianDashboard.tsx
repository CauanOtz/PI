import { useEffect, useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { BarChart2, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { getAlunosDoResponsavel } from "../../services/responsavel";

export const GuardianDashboard = () => {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAluno, setSelectedAluno] = useState<any | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user) {
        setAlunos([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getAlunosDoResponsavel(user.id);
        const arr = Array.isArray(data) ? data : (data?.alunos ?? []);
        setAlunos(arr);
      } catch (err: any) {
        console.error("Failed to load alunos for responsavel", err);
        setError(err?.response?.data?.mensagem ?? "Erro ao carregar dados");
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  useEffect(() => {
    if (alunos && alunos.length > 0 && !selectedAluno) {
      setSelectedAluno(alunos[0]);
    }
  }, [alunos, selectedAluno]);

  if (loading) {
    return (
      <div className="bg-slate-50 flex min-h-screen">
        <SidebarSection />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-[283px] mt-16 flex items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Carregando informações do aluno</CardTitle>
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

    if (!alunos || alunos.length === 0) {
    return (
      <div className="p-6">
        <SidebarSection />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-[283px] mt-16">
          <h2 className="text-xl font-semibold">Nenhum aluno vinculado</h2>
          <p className="text-slate-600">Você ainda não possui alunos vinculados a este responsável.</p>
        </main>
      </div>
    );
  }

  const student = selectedAluno ?? alunos[0];

  return (
    <div className="bg-slate-50 flex min-h-screen">
      <SidebarSection />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-[283px] mt-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Portal do Responsável</h1>
          <p className="text-slate-500 mt-1">Acompanhe a vida escolar de {student.nome}.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {alunos.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAluno(a)}
                className={`w-full text-left p-3 rounded-md border bg-white hover:bg-slate-50 transition-colors flex items-center gap-3 ${student?.id === a.id ? 'ring-2 ring-blue-300' : ''}`}>
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
                  <AvatarImage src={student.avatarUrl ?? ''} alt={student.nome} />
                  <AvatarFallback className="bg-blue-500 text-white">{student.nome ? String(student.nome).charAt(0) : '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-slate-800">{student.nome}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-700 mb-3">Informações do Aluno</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Nome:</span> <span className="font-medium">{student.nome ?? '-'}</span></div>
                  <div className="flex justify-between"><span>Idade:</span> <span className="font-medium">{student.idade ?? '-'}</span></div>
                  <div className="flex justify-between"><span>Contato:</span> <span className="font-medium">{student.contato ?? '-'}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800"><BarChart2 className="w-5 h-5 text-blue-500"/> Desempenho Acadêmico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Desempenho e eventos do aluno {student?.nome} serão exibidos aqui.</p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800"><Calendar className="w-5 h-5 text-blue-500"/> Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Eventos do aluno {student?.nome} aparecerão aqui.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuardianDashboard;

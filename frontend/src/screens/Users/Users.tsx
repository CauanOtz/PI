import { useEffect, useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { CreateUserModal, EditUserModal } from "../../components/modals/users";
import { DeleteConfirmationModal } from "../../components/modals/shared";
import { usuariosService, BackendUsuario, CreateUserPayload, EditUserPayload } from "../../services/users";
import { studentResponsibleService } from "../../services/studentResponsible";
import ResponsavelStudentsModal from "../../components/modals/users/ResponsavelStudentsModal";

export const Users = (): JSX.Element => {
  const [items, setItems] = useState<BackendUsuario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "responsavel">("all");
  const [toDelete, setToDelete] = useState<BackendUsuario | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BackendUsuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(10);

  const [studentsCount, setStudentsCount] = useState<Record<number, number>>({});
  const [studentsCache, setStudentsCache] = useState<Record<number, any[]>>({});
  const [showStudentsFor, setShowStudentsFor] = useState<number | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<any[] | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const roleParam = roleFilter === "all" ? undefined : roleFilter;
      const res = await usuariosService.list({ page, limit, search: searchTerm || undefined, role: roleParam });
      setItems((res as any).usuarios ?? []);

      const usuariosList: BackendUsuario[] = (res as any).usuarios ?? [];
      const responsaveis = usuariosList.filter(u => u.role === "responsavel" && typeof u.id === "number");
      if (responsaveis.length > 0) {
        const promises = responsaveis.map(async r => {
          try {
            const res = await studentResponsibleService.listByResponsavel(r.id);
            // suporta resposta paginada e wrappers: res | res.dados | res.data
            const body = (res as any);
            const payload = body?.dados ?? body?.data ?? body;
            let arr: any[] = [];
            if (Array.isArray(payload)) arr = payload;
            else if (Array.isArray(payload?.alunos)) arr = payload.alunos;
            else if (Array.isArray(payload?.rows)) arr = payload.rows;
            else if (Array.isArray(payload?.items)) arr = payload.items;
            const total = (typeof payload?.total === 'number')
              ? payload.total
              : (typeof payload?.paginacao?.total === 'number' ? payload.paginacao.total : arr.length);
            return { id: r.id, count: total, alunos: arr };
          } catch (err) {
            return { id: r.id, count: 0, alunos: [] };
          }
        });
        const results = await Promise.all(promises);
        const map: Record<number, number> = {};
        results.forEach(r => { map[r.id] = r.count; });
        setStudentsCount(map);
      } else {
        setStudentsCount({});
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.mensagem || "Falha ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, roleFilter]);

  const openStudentsModal = async (usuarioId: number) => {
    setShowStudentsFor(usuarioId);
    setSelectedStudents(null); // mostra "Carregando..." até completar

    if (studentsCache[usuarioId]) {
      setSelectedStudents(studentsCache[usuarioId]);
      return;
    }

    try {
      const res = await studentResponsibleService.listByResponsavel(usuarioId);
      console.debug("openStudentsModal - raw response:", res);

      const candidates = [
        res,
        res?.dados,
        res?.data,
        res?.dados?.dados
      ];

      let arr: any[] = [];

      for (const c of candidates) {
        if (!c) continue;
        if (Array.isArray(c)) {
          arr = c;
          break;
        }
        if (Array.isArray((c as any).alunos)) {
          arr = (c as any).alunos;
          break;
        }
        if (Array.isArray((c as any).rows)) {
          arr = (c as any).rows;
          break;
        }
        if (Array.isArray((c as any).items)) {
          arr = (c as any).items;
          break;
        }
      }

      if (arr.length === 0 && Array.isArray((res as any).alunos)) {
        arr = (res as any).alunos;
      }

      const total =
        (typeof (res as any)?.total === "number")
          ? (res as any).total
          : (typeof (res as any)?.paginacao?.total === "number")
            ? (res as any).paginacao.total
            : (typeof (res as any)?.dados?.paginacao?.total === "number")
              ? (res as any).dados.paginacao.total
              : arr.length;

      setStudentsCache(s => ({ ...s, [usuarioId]: arr }));
      setSelectedStudents(arr);
      setStudentsCount(c => ({ ...c, [usuarioId]: total }));
    } catch (err) {
      console.error("Erro ao buscar alunos do responsável:", err);
      toast.error("Falha ao buscar alunos do responsável");
      setSelectedStudents([]);
    }
  };

  const closeStudentsModal = () => {
    setShowStudentsFor(null);
    setSelectedStudents(null);
  };

  const handleDelete = async (cpf?: string) => {
    if (!cpf) return;
    try {
      await usuariosService.removeByCPF(cpf);
      toast.success("Usuário removido com sucesso!");
      load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.mensagem || "Falha ao remover usuário");
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full mt-16">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Usuários</h1>
              <p className="text-gray-600 mt-1">Gerenciamento de usuários</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <PlusIcon className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>

          {/* Filtros / Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm text-gray-600">Filtrar papel:</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="rounded border px-3 py-2">
                <option value="all">Todos</option>
                <option value="responsavel">Responsáveis</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input type="text" placeholder="Buscar por nome, email ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" />
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="min-w-[700px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Nome</th>
                    <th className="text-center p-4 hidden sm:table-cell">Papel</th>
                    <th className="text-center p-4 hidden sm:table-cell">Alunos</th>
                    <th className="text-center p-4 hidden sm:table-cell">Email</th>
                    <th className="text-center p-4 hidden md:table-cell">Telefone</th>
                    <th className="text-center p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center">Carregando...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum usuário encontrado</td></tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="p-4"><div className="font-medium">{item.nome}</div></td>
                        <td className="p-4 text-center hidden sm:table-cell">{item.role ?? "-"}</td>
                        <td className="p-4 text-center hidden sm:table-cell">
                          {item.role === "responsavel" ? (
                            <Button size="sm" variant="ghost" onClick={() => openStudentsModal(item.id)}>
                              Ver alunos ({studentsCount[item.id] ?? "—"})
                            </Button>
                          ) : "-"}
                        </td>
                        <td className="p-4 text-center hidden sm:table-cell">{item.email ?? "-"}</td>
                        <td className="p-4 text-center hidden md:table-cell">{item.telefone ?? "-"}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(item)} className="text-blue-600 hover:text-blue-700"><PencilIcon className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setToDelete(item)} className="text-red-600 hover:text-red-700"><TrashIcon className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal lista de alunos do responsável */}
      <ResponsavelStudentsModal
        isOpen={!!showStudentsFor}
        onClose={closeStudentsModal}
        responsavelName={showStudentsFor ? items.find(i => i.id === showStudentsFor)?.nome ?? "" : ""}
        students={selectedStudents}
        loading={selectedStudents === null}
        onViewProfile={(studentId) => {
          window.open(`/alunos/${studentId}`, "_blank");
        }}
      />

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (data: CreateUserPayload & { alunoId?: number }) => {
          try {
            const res = await usuariosService.create({
              nome: data.nome,
              email: data.email,
              telefone: data.telefone,
              cpf: data.cpf,
              senha: data.senha,
              role: data.role ?? 'responsavel'
            });
            const createdUser = (res as any).usuarioSemSenha ?? (res as any).usuario ?? null;
            if (createdUser && data.alunoId && typeof createdUser.id === 'number') {
              try {
                await studentResponsibleService.vincular({ idUsuario: createdUser.id, idAluno: data.alunoId });
              } catch (linkErr) {
                console.error("Falha ao vincular responsavel->aluno:", linkErr);
                toast.error("Usuário criado, mas falha ao vincular ao aluno.");
              }
            }
            toast.success("Usuário criado com sucesso!");
            setIsCreateOpen(false);
            load();
          } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.mensagem || "Falha ao criar usuário");
          }
        }}
      />

      <EditUserModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        user={editing ? { id: editing.id, nome: editing.nome, email: editing.email ?? "", telefone: editing.telefone ?? "", cpf: editing.cpf ?? "", role: (editing.role === "admin" ? "admin" : editing.role === "responsavel" ? "responsavel" : undefined) } : null}
        onSubmit={async (data: EditUserPayload & { alunoId?: number }) => {
           try {
             if (!editing) return;
             await usuariosService.updateByCPF(data.cpf, { nome: data.nome, email: data.email, telefone: data.telefone, ...(data.role ? { role: data.role } : {}) });
           if (data.role === "responsavel" && data.alunoId && editing?.id) {
             try {
               await studentResponsibleService.vincular({ idUsuario: editing.id, idAluno: data.alunoId });
             } catch (linkErr) {
               console.error("Falha ao vincular responsavel->aluno:", linkErr);
               toast.error("Usuário atualizado, mas falha ao vincular ao aluno.");
             }
           }
             toast.success("Usuário atualizado com sucesso!");
             setEditing(null);
             load();
           } catch (err: any) {
             console.error(err);
             toast.error(err?.response?.data?.mensagem || "Falha ao atualizar usuário");
           }
         }}
      />

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            handleDelete(toDelete.cpf);
            setToDelete(null);
          }
        }}
        title="Remover Usuário"
        description={`Tem certeza que deseja remover o usuário ${toDelete?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};
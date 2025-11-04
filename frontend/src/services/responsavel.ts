import { http } from "../lib/http";
import { ResponseSuccess } from "./users";
import { BackendAluno } from "./students";

export async function getAlunosDoResponsavel(responsavelId: number) {
  const res = await http.get<ResponseSuccess<{ alunos: BackendAluno[] }>>(`/responsaveis/${responsavelId}/alunos`);
  return res.data.dados.alunos;
}

export default { getAlunosDoResponsavel };

import { http } from "../lib/http";

export async function getAlunosDoResponsavel(responsavelId: number) {
  const res = await http.get(`/responsaveis/${responsavelId}/alunos`);
  const payload = res.data;

  if (Array.isArray(payload)) return payload;
  if (payload?.dados?.alunos) return payload.dados.alunos;
  if (payload?.alunos) return payload.alunos;
  return payload;
}

export default { getAlunosDoResponsavel };

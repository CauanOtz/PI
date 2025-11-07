import { http } from "../lib/http";
import { ResponseSuccess } from "./users";
import { Assistido } from "../types/assistido";

export async function getAssistidosDoResponsavel(responsavelId: number) {
  const res = await http.get<ResponseSuccess<{ assistidos: Assistido[] }>>(`/responsaveis/${responsavelId}/assistidos`);
  return res.data.dados.assistidos;
}

export default { getAssistidosDoResponsavel };

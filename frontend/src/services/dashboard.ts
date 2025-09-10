// ...new file...
import { http } from "../lib/http";

/**
 * Helpers para extrair arrays / paginacao de respostas backend com formatos variados.
 */
const extractBody = (res: any) => {
  const body = res?.data ?? res;
  return body;
};

const extractArray = (payload: any, keys = ["alunos", "items", "rows", "data"]) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  for (const k of keys) {
    if (Array.isArray(payload[k])) return payload[k];
  }
  // some wrappers use payload.dados.alunos etc.
  if (payload?.dados) return extractArray(payload.dados, keys);
  return [];
};

const extractTotal = (payload: any) => {
  if (!payload) return 0;
  if (typeof payload?.total === "number") return payload.total;
  if (typeof payload?.paginacao?.total === "number") return payload.paginacao.total;
  if (typeof payload?.dados?.paginacao?.total === "number") return payload.dados.paginacao.total;
  if (typeof payload?.length === "number") return payload.length;
  return 0;
};

export const dashboardService = {
  async getAlunosCount() {
    try {
      const res = await http.get("/alunos", { params: { page: 1, limit: 1 } });
      const body = extractBody(res);
      const payload = body?.dados ?? body;
      const total = extractTotal(payload);
      return total || 0;
    } catch (err) {
      // fallback try different path
      try {
        const res = await http.get("/alunos/list");
        const body = extractBody(res);
        const payload = body?.dados ?? body;
        return extractTotal(payload) || 0;
      } catch (e) {
        return 0;
      }
    }
  },

  async getNotifications() {
    const candidates = ["/notificacoes", "/notificacao", "/notifications", "/notifies"];
    for (const path of candidates) {
      try {
        const res = await http.get(path, { params: { page: 1, limit: 20 } });
        const body = extractBody(res);
        const arr = extractArray(body);
        if (arr.length > 0) return arr;
        // some responses are wrapper: body.dados.notificacoes
        if (Array.isArray(body?.dados?.notificacoes)) return body.dados.notificacoes;
      } catch (err) {
        // try next
      }
    }
    return [];
  },

  async getRecentActivities() {
    // backend may not have a dedicated endpoint; try some sensible paths
    const candidates = ["/presencas/recentes", "/atividades/recentes", "/activities/recent", "/presencas"];
    for (const path of candidates) {
      try {
        const res = await http.get(path, { params: { page: 1, limit: 6 } });
        const body = extractBody(res);
        const arr = extractArray(body);
        if (arr.length > 0) return arr.slice(0, 6);
      } catch (err) {
        // continue
      }
    }
    return [];
  },

  async getUpcomingEvents() {
    const candidates = ["/eventos", "/calendar/events", "/events", "/agenda"];
    for (const path of candidates) {
      try {
        const res = await http.get(path, { params: { page: 1, limit: 6 } });
        const body = extractBody(res);
        const arr = extractArray(body);
        if (arr.length > 0) return arr.slice(0, 6);
      } catch (err) {
        // continue
      }
    }
    return [];
  }
};
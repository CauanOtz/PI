// Centraliza extração segura de mensagens de erro vindas de Axios ou Exceptions genéricas.
export function extractErrorMessage(err: any, fallback: string = 'Erro inesperado'): string {
  if (!err) return fallback;
  const data = err?.response?.data;
  return (
    data?.mensagem ||
    data?.message ||
    data?.error ||
    err?.message ||
    fallback
  );
}

export default { extractErrorMessage };
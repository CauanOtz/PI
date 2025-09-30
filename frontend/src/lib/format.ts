// src/lib/format.ts
// Centraliza funções de formatação e normalização usadas em múltiplas telas.

/** Remove todos os caracteres não numéricos. */
export const digitsOnly = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '');
};

/** Formata CPF para 000.000.000-00 mantendo apenas dígitos válidos. */
export const formatCPF = (value: unknown): string => {
  const d = digitsOnly(value);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/(\d{3})(\d+)/, '$1.$2');
  if (d.length <= 9) return d.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/** Retorna data/hora local friendly ou traço se inválida. */
export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleString();
};

/** Normaliza valor truthy de backend que pode vir como string/number/boolean. */
export const toBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return ['1', 'true', 't', 'yes', 'sim'].includes(value.toLowerCase());
  return false;
};

export const truncate = (text: string, max = 120): string => {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max - 1) + '…';
};

export default { digitsOnly, formatCPF, formatDateTime, toBoolean, truncate };

import { cpf as cpfLib } from 'cpf-cnpj-validator';

export function normalizeCpf(value) {
  if (!value && value !== 0) return null;
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 11 ? digits : null;
}

export function formatCpf(value) {
  const digits = normalizeCpf(value) || value;
  if (!digits) return null;
  return String(digits).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function isValidCpf(value) {
  const digits = normalizeCpf(value);
  if (!digits) return false;
  return cpfLib.isValid(digits);
}

export default { normalizeCpf, formatCpf, isValidCpf };

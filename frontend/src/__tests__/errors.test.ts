import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from '../lib/errors';

describe('errors.extractErrorMessage', () => {
  it('returns mensagem from axios like error', () => {
    const err = { response: { data: { mensagem: 'Falhou' } } };
    expect(extractErrorMessage(err)).toBe('Falhou');
  });
  it('returns message field when mensagem missing', () => {
    const err = { response: { data: { message: 'Generic backend msg' } } };
    expect(extractErrorMessage(err)).toBe('Generic backend msg');
  });
  it('falls back to error.message', () => {
    const err = { message: 'Plain Error' };
    expect(extractErrorMessage(err)).toBe('Plain Error');
  });
  it('uses provided fallback when nothing present', () => {
    expect(extractErrorMessage(null, 'FB')).toBe('FB');
  });
});

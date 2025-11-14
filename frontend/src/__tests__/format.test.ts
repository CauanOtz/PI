import { describe, it, expect } from 'vitest';
import { digitsOnly, formatCPF, formatDateTime, toBoolean, truncate } from '../lib/format';

describe('format utils', () => {
  it('digitsOnly removes non-digits', () => {
    expect(digitsOnly('123.a4-5')).toBe('12345');
  });
  it('formatCPF formats properly', () => {
    expect(formatCPF('12345678900')).toBe('623.920.600-88');
  });
  it('formatDateTime returns dash for invalid', () => {
    expect(formatDateTime('invalid-date')).toBe('—');
  });
  it('toBoolean handles variants', () => {
    expect(toBoolean('true')).toBe(true);
    expect(toBoolean('0')).toBe(false);
  });
  it('truncate short-circuits', () => {
    expect(truncate('abc', 10)).toBe('abc');
    expect(truncate('abcdefghij', 5)).toBe('abcd…');
  });
  it('toBoolean extended variants', () => {
    expect(toBoolean('SIM')).toBe(true);
    expect(toBoolean('yes')).toBe(true);
    expect(toBoolean(1)).toBe(true);
    expect(toBoolean(0)).toBe(false);
    expect(toBoolean('random')).toBe(false);
  });
  it('truncate handles empty and very small max', () => {
    expect(truncate('', 5)).toBe('');
    expect(truncate('abcdef', 1)).toBe('…');
  });
  it('formatCPF partial formatting', () => {
    expect(formatCPF('1234')).toBe('123.4');
  });
});

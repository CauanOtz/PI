import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders ativa style', () => {
    render(<StatusBadge status="ativa" />);
    const el = screen.getByText('Ativa');
    expect(el.textContent).toBe('Ativa');
  });
  it('renders expirada style', () => {
    render(<StatusBadge status="expirada" />);
    expect(screen.getByText('Expirada').textContent).toBe('Expirada');
  });
  it('falls back for unknown status', () => {
    render(<StatusBadge status="foo" />);
    expect(screen.getByText('Foo').textContent).toBe('Foo');
  });
});

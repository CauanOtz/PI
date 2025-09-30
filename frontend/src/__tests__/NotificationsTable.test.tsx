import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationsTable, NotificationRow } from '../components/notifications/NotificationsTable';

const items: NotificationRow[] = [
  { id: 1, titulo: 'Teste', tipo: 'info', createdAt: new Date().toISOString(), destinatarios: [] },
];

describe('NotificationsTable', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  it('renders row', () => {
    render(<NotificationsTable items={items} editingId={null} savingEdit={false} deletingId={null} editFields={{ titulo: '', mensagem: '', tipo: 'info', dataExp: '' }} onChangeEdit={() => {}} onOpenEdit={() => {}} onCancelEdit={() => {}} onSaveEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Teste')).toBeTruthy();
  });

  it('enters edit mode', () => {
    const handleOpen = vi.fn();
    render(<NotificationsTable items={items} editingId={null} savingEdit={false} deletingId={null} editFields={{ titulo: '', mensagem: '', tipo: 'info', dataExp: '' }} onChangeEdit={() => {}} onOpenEdit={handleOpen} onCancelEdit={() => {}} onSaveEdit={() => {}} onDelete={() => {}} />);
    fireEvent.click(screen.getByLabelText('Editar notificação'));
    expect(handleOpen).toHaveBeenCalled();
  });

  it('shows Ativa for future expiration and Expirada for past expiration', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const rows: NotificationRow[] = [
      { id: 2, titulo: 'Futura', tipo: 'info', createdAt: new Date().toISOString(), dataExpiracao: future },
      { id: 3, titulo: 'Passada', tipo: 'info', createdAt: new Date().toISOString(), dataExpiracao: past },
    ];
    render(<NotificationsTable items={rows} editingId={null} savingEdit={false} deletingId={null} editFields={{ titulo: '', mensagem: '', tipo: 'info', dataExp: '' }} onChangeEdit={() => {}} onOpenEdit={() => {}} onCancelEdit={() => {}} onSaveEdit={() => {}} onDelete={() => {}} />);
    const ativa = screen.getAllByText(/Ativa|Expirada/).find(el => el.textContent === 'Ativa');
    const expirada = screen.getAllByText(/Ativa|Expirada/).find(el => el.textContent === 'Expirada');
    expect(ativa).toBeTruthy();
    expect(expirada).toBeTruthy();
  });

  it('marks row as expirada when time passes (Date.now mocked)', () => {
    const baseTime = Date.now();
    const in30s = new Date(baseTime + 30_000).toISOString();
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);
    const row: NotificationRow = { id: 4, titulo: 'Quase', tipo: 'info', createdAt: new Date().toISOString(), dataExpiracao: in30s };
    const { rerender } = render(<NotificationsTable items={[row]} editingId={null} savingEdit={false} deletingId={null} editFields={{ titulo: '', mensagem: '', tipo: 'info', dataExp: '' }} onChangeEdit={() => {}} onOpenEdit={() => {}} onCancelEdit={() => {}} onSaveEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Ativa')).toBeTruthy();
    vi.setSystemTime(baseTime + 31_000);
    rerender(<NotificationsTable items={[row]} editingId={null} savingEdit={false} deletingId={null} editFields={{ titulo: '', mensagem: '', tipo: 'info', dataExp: '' }} onChangeEdit={() => {}} onOpenEdit={() => {}} onCancelEdit={() => {}} onSaveEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Expirada')).toBeTruthy();
  });
});

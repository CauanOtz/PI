import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../context/AuthProvider', () => ({
  useAuth: () => ({ authed: true, user: { id: 1, nome: 'Admin', role: 'admin' }, loading: false }),
  AuthProvider: ({ children }: any) => <>{children}</>
}));

vi.mock('../services/notificacao');
vi.mock('../services/users');

vi.mock('../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

import * as usersService from '../services/users';
import * as notifService from '../services/notificacao';
import { NotificationsAdmin } from '../screens/Notifications/NotificationsAdmin';

const buildUsuario = (i: number) => ({ id: i, nome: `Resp ${i}`, cpf: `0000000000${i}` });

describe('NotificationsAdmin edit & delete flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleNotifications = [
    { id: 10, titulo: 'Original', mensagem: 'Mensagem', tipo: 'info', dataExpiracao: null, createdAt: new Date().toISOString() },
    { id: 11, titulo: 'Outra', mensagem: 'Mais', tipo: 'alerta', dataExpiracao: null, createdAt: new Date().toISOString() }
  ];

  it('edits a notification and saves changes', async () => {
    (usersService as any).usuariosService = { list: vi.fn().mockResolvedValue({ usuarios: [buildUsuario(1)] }) };
    (notifService as any).notificacaoService = {
      list: vi.fn().mockResolvedValue(sampleNotifications),
      update: vi.fn().mockResolvedValue({ mensagem: 'Atualizada' }),
      delete: vi.fn(),
      enviar: vi.fn()
    };

    render(<MemoryRouter initialEntries={['/notificacoes']}><NotificationsAdmin /></MemoryRouter>);

    // Wait for responsaveis loaded
    await screen.findByPlaceholderText('Buscar responsável...');

    // Load all notifications
    fireEvent.click(screen.getByText('Ver todas as notificações'));
    await waitFor(() => expect((notifService as any).notificacaoService.list).toHaveBeenCalled());

    // Click edit button for first row (aria-label)
    const editButtons = screen.getAllByLabelText('Editar notificação');
    fireEvent.click(editButtons[0]);

    const titleInput = screen.getByDisplayValue('Original');
    fireEvent.change(titleInput, { target: { value: 'Atualizado' } });

    // Change tipo select
  // There are two selects with value 'info' (editor form + row edit). Narrow to the row edit container.
  const editingRow = titleInput.closest('tr') as HTMLElement;
  const selects = editingRow.querySelectorAll('select');
  expect(selects.length).toBeGreaterThan(0);
  fireEvent.change(selects[0], { target: { value: 'urgente' } });

    fireEvent.click(screen.getByText('Salvar'));

    await waitFor(() => expect((notifService as any).notificacaoService.update).toHaveBeenCalledWith('10', expect.objectContaining({ titulo: 'Atualizado', tipo: 'urgente' })));
  });

  it('deletes a notification through modal confirmation', async () => {
    (usersService as any).usuariosService = { list: vi.fn().mockResolvedValue({ usuarios: [buildUsuario(1)] }) };
    (notifService as any).notificacaoService = {
      list: vi.fn().mockResolvedValue(sampleNotifications),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue({ mensagem: 'Excluída' }),
      enviar: vi.fn()
    };

    render(<MemoryRouter initialEntries={['/notificacoes']}><NotificationsAdmin /></MemoryRouter>);

    await screen.findByPlaceholderText('Buscar responsável...');
    fireEvent.click(screen.getByText('Ver todas as notificações'));
    await waitFor(() => expect((notifService as any).notificacaoService.list).toHaveBeenCalled());

    const deleteButtons = screen.getAllByLabelText('Excluir notificação');
    fireEvent.click(deleteButtons[0]);

    // Modal should appear with confirmation text
    await screen.findByText(/Confirmar Exclusão/i);
    fireEvent.click(screen.getByText('Remover'));

    await waitFor(() => expect((notifService as any).notificacaoService.delete).toHaveBeenCalledWith('10'));
  });
});

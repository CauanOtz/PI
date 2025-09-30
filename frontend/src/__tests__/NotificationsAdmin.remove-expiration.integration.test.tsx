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

describe('NotificationsAdmin remove expiration flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes expiration and sends dataExpiracao null on save', async () => {
    const expFuture = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    (usersService as any).usuariosService = { list: vi.fn().mockResolvedValue({ usuarios: [buildUsuario(1)] }) };
    (notifService as any).notificacaoService = {
      list: vi.fn().mockResolvedValue([
        { id: 21, titulo: 'Com Expiração', mensagem: 'Msg', tipo: 'info', dataExpiracao: expFuture, createdAt: new Date().toISOString() }
      ]),
      update: vi.fn().mockResolvedValue({ mensagem: 'Atualizada' }),
      delete: vi.fn(),
      enviar: vi.fn()
    };

    render(<MemoryRouter initialEntries={['/notificacoes']}><NotificationsAdmin /></MemoryRouter>);

    await screen.findByPlaceholderText('Buscar responsável...');

    fireEvent.click(screen.getByText('Ver todas as notificações'));
    await waitFor(() => expect((notifService as any).notificacaoService.list).toHaveBeenCalled());

    fireEvent.click(screen.getByLabelText('Editar notificação'));

  const originalDt = new Date(expFuture);
  const expectedLocal = new Date(originalDt.getTime() - originalDt.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  const dateInput = document.querySelector('tr input[type="datetime-local"]') as HTMLInputElement | null;
  expect(dateInput).toBeTruthy();
  expect(dateInput!.value).toBe(expectedLocal);

    const removeBtn = screen.getByText('Remover expiração');
    fireEvent.click(removeBtn);
    expect(dateInput!.value).toBe('');

    fireEvent.click(screen.getByText('Salvar'));

    await waitFor(() => expect((notifService as any).notificacaoService.update).toHaveBeenCalled());
    const payload = (notifService as any).notificacaoService.update.mock.calls[0][1];
    expect(payload.dataExpiracao).toBeNull();
  });
});

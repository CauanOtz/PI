import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as usersService from '../services/users';
import * as notifService from '../services/notificacao';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../context/AuthProvider', () => {
  return {
    useAuth: () => ({
      authed: true,
      user: { id: 1, nome: 'Admin', role: 'admin' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    }),
    AuthProvider: ({ children }: any) => <>{children}</>,
  };
});

import { NotificationsAdmin } from '../screens/Notifications/NotificationsAdmin';

vi.mock('../services/users');
vi.mock('../services/notificacao');
vi.mock('../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn().mockResolvedValue({ data: { id: 99 } }) } }));

const buildUsuario = (i: number) => ({ id: i, nome: `Resp ${i}`, cpf: `0000000000${i}` });

describe('NotificationsAdmin integration (lite)', () => {
  it('creates notification and sends to selected destinatarios', async () => {
    (usersService as any).usuariosService = { list: vi.fn().mockResolvedValue({ usuarios: [buildUsuario(1), buildUsuario(2)] }) };
    (notifService as any).notificacaoService = {
      list: vi.fn().mockResolvedValue([]),
      enviar: vi.fn().mockResolvedValue({ mensagem: 'OK', novasAssociacoes: 2, associacoesExistentes: 0 }),
      update: vi.fn(), delete: vi.fn()
    };

    render(
      <MemoryRouter initialEntries={['/notificacoes']}>
        <NotificationsAdmin />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByPlaceholderText('Buscar responsável...')).toBeTruthy());

    fireEvent.change(screen.getByPlaceholderText('Ex: Reunião de pais'), { target: { value: 'Titulo X' } });
    fireEvent.change(screen.getByPlaceholderText('Descreva os detalhes da notificação...'), { target: { value: 'Mensagem Y' } });
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    fireEvent.click(screen.getByText('Criar e Enviar'));

    await waitFor(() => expect((notifService as any).notificacaoService.enviar).toHaveBeenCalled());
  });
});

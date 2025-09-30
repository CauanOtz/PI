import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

vi.mock('../context/AuthProvider', () => {
  const logout = vi.fn();
  return {
    useAuth: () => ({
      user: { id: 1, nome: 'Admin', role: 'admin' },
      loading: false,
      logout,
    }),
  };
});

import { SidebarSection } from '../components/layout/SidebarSection';

const setup = (initialPath: string = '/dashboard') => {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<SidebarSection />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SidebarSection (admin)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders all admin navigation items', () => {
    setup('/dashboard');
    const labels = [
      'Dashboard',
      'Presença',
      'Aulas',
      'Alunos/Turmas',
      'Usuários',
      'Calendário',
      'Relatório',
      'Notificações',
      'Configurações',
    ];
    labels.forEach(label => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('highlights active route', () => {
    setup('/attendance');
    const attendanceBtn = screen.getByRole('button', { name: 'Presença' });
    expect(attendanceBtn.className).toContain('bg-projectsecondary-300');
  });
});

describe('SidebarSection (guardian)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders only guardian nav items', async () => {
    vi.resetModules();
    vi.doMock('../context/AuthProvider', () => {
      const logout = vi.fn();
      return {
        useAuth: () => ({ user: { id: 2, nome: 'Resp', role: 'responsavel' }, loading: false, logout }),
      };
    });
    const { SidebarSection: GuardianSidebar } = await import('../components/layout/SidebarSection');

    render(
      <MemoryRouter initialEntries={['/guardian-dashboard']}>
        <Routes>
          <Route path="*" element={<GuardianSidebar />} />
        </Routes>
      </MemoryRouter>
    );

    ['Painel do Aluno', 'Notificações', 'Configurações'].forEach(label => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
    ['Dashboard','Presença','Aulas','Alunos/Turmas','Usuários','Calendário','Relatório'].forEach(label => {
      expect(screen.queryByRole('button', { name: label })).toBeNull();
    });
  });
});

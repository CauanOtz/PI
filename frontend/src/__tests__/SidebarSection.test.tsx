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
      'Assistidos',
      'Atividades',
      'Presenças',
      'Documentos',
    ];
    labels.forEach(label => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('highlights active route', () => {
    setup('/attendance');
    const attendanceBtn = screen.getByRole('button', { name: 'Presenças' });
    expect(attendanceBtn.className).toContain('bg-projectsecondary-300');
  });
});

describe('SidebarSection (no guardian role)', () => {
  it('does not have guardian-specific routes', () => {
    setup('/dashboard');
    expect(screen.queryByRole('button', { name: 'Painel do Aluno' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Notificações' })).toBeNull();
  });
});

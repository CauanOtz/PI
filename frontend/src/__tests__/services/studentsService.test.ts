import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studentsService } from '../../services/students';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('studentsService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list unwraps dados', async () => {
    (http.get as any).mockResolvedValue({ data: { sucesso: true, dados: { alunos: [{ id: 1, nome: 'Alu' }], paginacao: { total: 1, paginaAtual: 1, totalPaginas: 1, itensPorPagina: 10, temProximaPagina: false, temPaginaAnterior: false } } } });
    const res = await studentsService.list({ page: 1 });
    expect(http.get).toHaveBeenCalledWith('/alunos', { params: { page: 1 } });
    expect(res.alunos.length).toBe(1);
  });

  it('get returns single aluno', async () => {
    (http.get as any).mockResolvedValue({ data: { sucesso: true, dados: { id: 7, nome: 'Aluno 7' } } });
    const aluno = await studentsService.get(7);
    expect(http.get).toHaveBeenCalledWith('/alunos/7');
    expect(aluno.nome).toBe('Aluno 7');
  });

  it('create posts and returns aluno', async () => {
    (http.post as any).mockResolvedValue({ data: { sucesso: true, dados: { id: 10, nome: 'Novo' } } });
    const created = await studentsService.create({ nome: 'Novo' });
    expect(http.post).toHaveBeenCalledWith('/alunos', { nome: 'Novo' });
    expect(created.id).toBe(10);
  });

  it('update puts and returns aluno', async () => {
    (http.put as any).mockResolvedValue({ data: { sucesso: true, dados: { id: 5, nome: 'Editado' } } });
    const updated = await studentsService.update(5, { nome: 'Editado' });
    expect(http.put).toHaveBeenCalledWith('/alunos/5', { nome: 'Editado' });
    expect(updated.nome).toBe('Editado');
  });

  it('remove deletes and returns flag', async () => {
    (http.delete as any).mockResolvedValue({ data: { sucesso: true } });
    const res = await studentsService.remove(3);
    expect(http.delete).toHaveBeenCalledWith('/alunos/3');
    expect(res.sucesso).toBe(true);
  });
});

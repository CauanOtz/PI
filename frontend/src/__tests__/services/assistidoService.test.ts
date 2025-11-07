import { describe, it, expect, vi, beforeEach } from 'vitest';
import assistidoService from '../../services/assistidoService';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('assistidoService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list unwraps dados', async () => {
    (http.get as any).mockResolvedValue({ data: { sucesso: true, dados: { assistidos: [{ id: 1, nome: 'Assistido' }], paginacao: { total: 1, paginaAtual: 1, totalPaginas: 1, itensPorPagina: 10, temProximaPagina: false, temPaginaAnterior: false } } } });
    const res = await assistidoService.list({ page: 1 });
    expect(http.get).toHaveBeenCalledWith('/assistidos', { params: { page: 1 } });
    expect(res.assistidos.length).toBe(1);
  });

  it('get returns single assistido', async () => {
    (http.get as any).mockResolvedValue({ data: { sucesso: true, dados: { assistido: { id: 7, nome: 'Assistido 7' } } } });
    const assistido = await assistidoService.getById(7);
    expect(http.get).toHaveBeenCalledWith('/assistidos/7');
    expect(assistido.nome).toBe('Assistido 7');
  });

  it('create posts and returns assistido', async () => {
    (http.post as any).mockResolvedValue({ data: { sucesso: true, dados: { id: 10, nome: 'Novo' } } });
    const created = await assistidoService.create({ nome: 'Novo', dataNascimento: '2020-01-01', sexo: 'Masculino' });
    expect(http.post).toHaveBeenCalledWith('/assistidos', { nome: 'Novo', dataNascimento: '2020-01-01', sexo: 'Masculino' });
    expect(created.id).toBe(10);
  });

  it('update puts and returns assistido', async () => {
    (http.put as any).mockResolvedValue({ data: { sucesso: true, dados: { id: 5, nome: 'Editado' } } });
    const updated = await assistidoService.update(5, { nome: 'Editado' });
    expect(http.put).toHaveBeenCalledWith('/assistidos/5', { nome: 'Editado' });
    expect(updated.nome).toBe('Editado');
  });

  it('remove deletes', async () => {
    await assistidoService.delete(3);
    expect(http.delete).toHaveBeenCalledWith('/assistidos/3');
  });
});
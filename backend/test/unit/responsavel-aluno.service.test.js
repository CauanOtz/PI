// test/unit/responsavel-aluno.service.test.js
import { jest } from '@jest/globals';

const mockResponsavelAluno = {
  findOne: jest.fn(),
  create: jest.fn()
};

const mockUsuario = {
  findOne: jest.fn()
};

const mockAluno = {
  findByPk: jest.fn()
};

jest.unstable_mockModule('../../src/models/ResponsavelAluno.model.js', () => ({
  default: mockResponsavelAluno
}));

jest.unstable_mockModule('../../src/models/Usuario.model.js', () => ({
  default: mockUsuario
}));

jest.unstable_mockModule('../../src/models/Aluno.model.js', () => ({
  default: mockAluno
}));

const ResponsavelAlunoService = (await import('../../src/services/responsavel-aluno.service.js')).default;

describe('ResponsavelAlunoService', () => {
  let responsavelAlunoService;

  beforeEach(() => {
    jest.clearAllMocks();
    responsavelAlunoService = new ResponsavelAlunoService();
  });

  describe('vincular', () => {
    test('deve retornar notFound quando responsável não existe', async () => {
      mockUsuario.findOne.mockResolvedValue(null);

      const result = await responsavelAlunoService.vincular(1, 1);

      expect(result).toEqual({
        notFound: true,
        message: 'Responsável não encontrado ou não tem permissão'
      });
    });

    test('deve retornar notFound quando aluno não existe', async () => {
      mockUsuario.findOne.mockResolvedValue({ id: 1, role: 'responsavel' });
      mockAluno.findByPk.mockResolvedValue(null);

      const result = await responsavelAlunoService.vincular(1, 1);

      expect(result).toEqual({
        notFound: true,
        message: 'Aluno não encontrado'
      });
    });

    test('deve retornar conflict quando vínculo já existe', async () => {
      mockUsuario.findOne.mockResolvedValue({ id: 1, role: 'responsavel' });
      mockAluno.findByPk.mockResolvedValue({ id: 1 });
      mockResponsavelAluno.findOne.mockResolvedValue({ id: 1 });

      const result = await responsavelAlunoService.vincular(1, 1);

      expect(result).toEqual({
        conflict: true,
        message: 'Este responsável já está vinculado a este aluno'
      });
    });

    test('deve criar vínculo com sucesso', async () => {
      const mockVinculo = { id: 1, id_usuario: 1, id_aluno: 1 };
      mockUsuario.findOne.mockResolvedValue({ id: 1, role: 'responsavel' });
      mockAluno.findByPk.mockResolvedValue({ id: 1 });
      mockResponsavelAluno.findOne.mockResolvedValue(null);
      mockResponsavelAluno.create.mockResolvedValue(mockVinculo);

      const result = await responsavelAlunoService.vincular(1, 1);

      expect(result).toEqual({ vinculo: mockVinculo });
      expect(mockResponsavelAluno.create).toHaveBeenCalledWith({
        id_usuario: 1,
        id_aluno: 1
      });
    });
  });

  describe('desvincular', () => {
    test('deve retornar notFound quando vínculo não existe', async () => {
      mockResponsavelAluno.findOne.mockResolvedValue(null);

      const result = await responsavelAlunoService.desvincular(1, 1);

      expect(result).toEqual({
        notFound: true,
        message: 'Vínculo não encontrado'
      });
    });

    test('deve desvincular com sucesso', async () => {
      const mockVinculo = {
        id_usuario: 1,
        id_aluno: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      mockResponsavelAluno.findOne.mockResolvedValue(mockVinculo);

      const result = await responsavelAlunoService.desvincular(1, 1);

      expect(result).toEqual({ success: true });
      expect(mockVinculo.destroy).toHaveBeenCalled();
    });
  });
});
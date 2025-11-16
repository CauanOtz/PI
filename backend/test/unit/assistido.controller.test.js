import { jest } from '@jest/globals';

const mockAssistidoService = {
  listAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const mockAssistidoDTO = {
  list: jest.fn(),
  from: jest.fn()
};

const mockPaginationDTO = jest.fn();

jest.unstable_mockModule('../../src/services/assistido.service.js', () => ({ default: mockAssistidoService }));
jest.unstable_mockModule('../../src/dto/index.js', () => ({
  AssistidoDTO: mockAssistidoDTO,
  PaginationDTO: mockPaginationDTO
}));
jest.unstable_mockModule('../../src/utils/response.js', () => ({
  ok: jest.fn((res, data) => res.json({ sucesso: true, dados: data }))
}));

const {
  listarAssistidos,
  obterAssistidoPorId,
  criarAssistido,
  atualizarAssistido,
  excluirAssistido
} = await import('../../src/controllers/assistido.controller.js');

describe('AssistidoController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
    next = jest.fn();

    mockAssistidoService.listAll.mockReset();
    mockAssistidoService.getById.mockReset();
    mockAssistidoService.create.mockReset();
    mockAssistidoService.update.mockReset();
    mockAssistidoService.delete.mockReset();
    mockAssistidoDTO.list.mockReset();
    mockAssistidoDTO.from.mockReset();
    mockPaginationDTO.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarAssistidos', () => {
    it('deve listar assistidos com paginação', async () => {
      const assistidos = [
        { id: 1, nome: 'Maria Silva' },
        { id: 2, nome: 'João Santos' }
      ];

      mockAssistidoService.listAll.mockResolvedValue({
        count: 2,
        rows: assistidos,
        page: 1,
        limit: 10
      });

      mockAssistidoDTO.list.mockReturnValue(assistidos);
      mockPaginationDTO.mockImplementation((data) => data);

      req.query = { page: '1', limit: '10' };

      await listarAssistidos(req, res, next);

      expect(mockAssistidoService.listAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined
      });
      expect(mockAssistidoDTO.list).toHaveBeenCalledWith(assistidos);
      expect(res.json).toHaveBeenCalled();
    });

    it('deve buscar com termo de pesquisa', async () => {
      mockAssistidoService.listAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, nome: 'Maria Silva' }],
        page: 1,
        limit: 10
      });

      mockAssistidoDTO.list.mockReturnValue([]);
      mockPaginationDTO.mockImplementation((data) => data);

      req.query = { search: 'Maria' };

      await listarAssistidos(req, res, next);

      expect(mockAssistidoService.listAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'Maria'
      });
    });

    it('deve chamar next com erro em caso de falha', async () => {
      const erro = new Error('Erro no serviço');
      mockAssistidoService.listAll.mockRejectedValue(erro);

      await listarAssistidos(req, res, next);

      expect(next).toHaveBeenCalledWith(erro);
    });
  });

  describe('obterAssistidoPorId', () => {
    it('deve retornar assistido por ID', async () => {
      const assistido = {
        id: 1,
        nome: 'Maria Silva',
        endereco: { cep: '12345-678' },
        contatos: [{ telefone: '(11) 98765-4321' }],
        filiacao: { mae: 'Ana Silva' }
      };

      mockAssistidoService.getById.mockResolvedValue(assistido);
      mockAssistidoDTO.from.mockReturnValue(assistido);

      req.params = { id: '1' };

      await obterAssistidoPorId(req, res, next);

      expect(mockAssistidoService.getById).toHaveBeenCalledWith('1');
      expect(mockAssistidoDTO.from).toHaveBeenCalledWith(assistido);
      expect(res.json).toHaveBeenCalled();
    });

    it('deve chamar next com erro se assistido não encontrado', async () => {
      const erro = new Error('Assistido não encontrado');
      mockAssistidoService.getById.mockRejectedValue(erro);

      req.params = { id: '999' };

      await obterAssistidoPorId(req, res, next);

      expect(next).toHaveBeenCalledWith(erro);
    });
  });

  describe('criarAssistido', () => {
    it('deve criar assistido com sucesso', async () => {
      const dadosAssistido = {
        nome: 'Maria Silva',
        dataNascimento: '2015-07-22',
        sexo: 'Feminino',
        endereco: {
          cep: '12345-678',
          logradouro: 'Rua das Flores'
        },
        numero: '123',
        contatos: [
          {
            telefone: '(11) 98765-4321',
            nomeContato: 'Maria',
            parentesco: 'Mãe',
            ordemPrioridade: 1
          }
        ],
        filiacao: {
          mae: 'Ana Silva'
        }
      };

      const assistidoCriado = { id: 1, ...dadosAssistido };

      mockAssistidoService.create.mockResolvedValue(assistidoCriado);
      mockAssistidoDTO.from.mockReturnValue(assistidoCriado);

      req.body = dadosAssistido;

      await criarAssistido(req, res, next);

      expect(mockAssistidoService.create).toHaveBeenCalledWith(dadosAssistido);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        dados: { assistido: assistidoCriado }
      });
    });

    it('deve retornar erro 400 para erro de validação Sequelize', async () => {
      const validationError = {
        name: 'SequelizeValidationError',
        errors: [
          { path: 'nome', message: 'Nome é obrigatório' },
          { path: 'dataNascimento', message: 'Data de nascimento inválida' }
        ]
      };

      mockAssistidoService.create.mockRejectedValue(validationError);

      req.body = { nome: '' };

      await criarAssistido(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        erro: {
          mensagem: 'Erro de validação',
          detalhes: [
            { campo: 'nome', mensagem: 'Nome é obrigatório' },
            { campo: 'dataNascimento', mensagem: 'Data de nascimento inválida' }
          ]
        }
      });
    });

    it('deve chamar next para erros não-validação', async () => {
      const erro = new Error('Erro no banco de dados');
      mockAssistidoService.create.mockRejectedValue(erro);

      req.body = { nome: 'Teste' };

      await criarAssistido(req, res, next);

      expect(next).toHaveBeenCalledWith(erro);
    });
  });

  describe('atualizarAssistido', () => {
    it('deve atualizar assistido com sucesso', async () => {
      const dadosAtualizacao = {
        nome: 'Maria Silva ATUALIZADA',
        contatos: [
          {
            telefone: '(11) 99999-9999',
            nomeContato: 'Novo Contato',
            parentesco: 'Tio',
            ordemPrioridade: 1
          }
        ]
      };

      const assistidoAtualizado = { id: 1, ...dadosAtualizacao };

      mockAssistidoService.update.mockResolvedValue(assistidoAtualizado);
      mockAssistidoDTO.from.mockReturnValue(assistidoAtualizado);

      req.params = { id: '1' };
      req.body = dadosAtualizacao;

      await atualizarAssistido(req, res, next);

      expect(mockAssistidoService.update).toHaveBeenCalledWith('1', dadosAtualizacao);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        dados: { assistido: assistidoAtualizado }
      });
    });

    it('deve retornar 404 se assistido não encontrado', async () => {
      mockAssistidoService.update.mockResolvedValue(null);

      req.params = { id: '999' };
      req.body = { nome: 'Teste' };

      await atualizarAssistido(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Assistido não encontrado'
      });
    });

    it('deve chamar next com erro em caso de falha', async () => {
      const erro = new Error('Erro no serviço');
      mockAssistidoService.update.mockRejectedValue(erro);

      req.params = { id: '1' };
      req.body = { nome: 'Teste' };

      await atualizarAssistido(req, res, next);

      expect(next).toHaveBeenCalledWith(erro);
    });
  });

  describe('excluirAssistido', () => {
    it('deve excluir assistido com sucesso', async () => {
      mockAssistidoService.delete.mockResolvedValue(true);

      req.params = { id: '1' };

      await excluirAssistido(req, res, next);

      expect(mockAssistidoService.delete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('deve retornar 404 se assistido não encontrado', async () => {
      mockAssistidoService.delete.mockResolvedValue(false);

      req.params = { id: '999' };

      await excluirAssistido(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Assistido não encontrado'
      });
    });

    it('deve chamar next com erro em caso de falha', async () => {
      const erro = new Error('Erro ao excluir');
      mockAssistidoService.delete.mockRejectedValue(erro);

      req.params = { id: '1' };

      await excluirAssistido(req, res, next);

      expect(next).toHaveBeenCalledWith(erro);
    });
  });
});

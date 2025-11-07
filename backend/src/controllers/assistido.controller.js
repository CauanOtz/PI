// src/controllers/assistido.controller.js
import { AssistidoDTO, PaginationDTO } from '../dto/index.js';
import AssistidoService from '../services/assistido.service.js';
import { ok } from '../utils/response.js';

/**
 * @openapi
 * tags:
 *   name: Assistidos
 *   description: Gerenciamento de assistidos
 */

/**
 * @openapi
 * /assistidos:
 *   get:
 *     summary: Lista todos os assistidos
 *     tags: [Assistidos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para filtrar assistidos por nome
 *       - in: query
 *         name: responsavelId
 *         schema:
 *           type: integer
 *         description: ID do responsável para filtrar assistidos associados a ele.
 *     responses:
 *       200:
 *         description: Lista de assistidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAssistidos'
 */
export const listarAssistidos = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const { count, rows: assistidos, page: svcPage, limit: svcLimit } = await AssistidoService.listAll({
      page,
      limit,
      search: req.query.search,
      responsavelId: req.query.responsavelId,
    });

    const totalPages = Math.ceil(count / svcLimit);
    const assistidosDTO = AssistidoDTO.list(assistidos, { includeResponsaveis: true });
    const paginacao = new PaginationDTO({ total: count, paginaAtual: svcPage, totalPaginas: totalPages, itensPorPagina: svcLimit });
    return ok(res, { assistidos: assistidosDTO, paginacao });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /assistidos/{id}:
 *   get:
 *     summary: Obtém um assistido pelo ID
 *     tags: [Assistidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido a ser obtido
 *     responses:
 *       200:
 *         description: Assistido encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 dados:
 *                   type: object
 *                   properties:
 *                     assistido:
 *                       $ref: '#/components/schemas/Assistido'
 *       404:
 *         description: Assistido não encontrado
 */
export const obterAssistidoPorId = async (req, res, next) => {
  try {
    const assistido = await AssistidoService.getById(req.params.id);
    const dto = AssistidoDTO.from(assistido, { includeResponsaveis: true });
    return ok(res, { assistido: dto });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /assistidos:
 *   post:
 *     summary: Cria um novo assistido
 *     tags: [Assistidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - dataNascimento
 *               - sexo
 *             properties:
 *               nome:
 *                 type: string
 *                 maxLength: 100
 *                 minLength: 3
 *                 description: Nome completo do assistido
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento (não pode ser futura)
 *               sexo:
 *                 type: string
 *                 enum: ['Feminino', 'Masculino']
 *                 description: Sexo do assistido
 *               cartaoSus:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número do cartão do SUS (opcional)
 *               rg:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número do RG (opcional)
 *               endereco:
 *                 type: string
 *                 maxLength: 255
 *                 description: Logradouro e número (opcional)
 *               bairro:
 *                 type: string
 *                 maxLength: 100
 *                 description: Bairro de residência (opcional)
 *               cep:
 *                 type: string
 *                 maxLength: 9
 *                 pattern: "^\\d{5}-\\d{3}$"
 *                 description: CEP no formato 12345-678 (opcional)
 *               cidade:
 *                 type: string
 *                 maxLength: 100
 *                 description: Cidade de residência (opcional)
 *               contato:
 *                 type: string
 *                 maxLength: 20
 *                 pattern: "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$"
 *                 description: Telefone no formato (DD) 99999-9999 ou (DD) 9999-9999 (opcional)
 *               problemasSaude:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Problemas de saúde, alergias ou condições especiais (opcional)
 *               pai:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nome completo do pai (opcional)
 *               mae:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nome completo da mãe (opcional)
 *             example:
 *               nome: "Maria Silva Oliveira Santos"
 *               dataNascimento: "2015-07-22"
 *               sexo: "Feminino"
 *               cartaoSus: "163704163610004"
 *               rg: "12.345.678-9"
 *               endereco: "Rua das Flores, 123"
 *               bairro: "Centro"
 *               cep: "12345-678"
 *               cidade: "São Paulo"
 *               contato: "(11) 98765-4321"
 *               pai: "João Oliveira Santos"
 *               mae: "Ana Silva Oliveira"
 *     responses:
 *       201:
 *         description: Assistido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAssistido'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Responsável(is) não encontrado(s)
 */
export const criarAssistido = async (req, res, next) => {
  try {
    const { 
      nome, 
      dataNascimento, 
      sexo,
      cartaoSus,
      rg,
      endereco,
      bairro,
      cep,
      cidade,
      contato,
      problemasSaude,
      pai,
      mae
    } = req.body;

    console.log('Controller - Dados recebidos:', {
      nome, 
      dataNascimento, 
      sexo,
      cartaoSus,
      rg,
      endereco,
      bairro,
      cep,
      cidade,
      contato,
      problemasSaude,
      pai,
      mae
    });

    try {
      const novoAssistido = await AssistidoService.create({ 
        nome, 
        dataNascimento, 
        sexo,
        cartaoSus,
        rg,
        endereco,
        bairro,
        cep,
        cidade,
        contato,
        problemasSaude,
        pai,
        mae
      });
      
      res.status(201);
      return res.json({ sucesso: true, dados: { assistido: novoAssistido } });
    } catch (serviceError) {
      console.error('Erro no serviço:', {
        name: serviceError.name,
        message: serviceError.message,
        errors: serviceError.errors,
        validationErrors: serviceError.errors?.map(err => ({
          field: err.path,
          value: err.value,
          message: err.message
        }))
      });
      
      if (serviceError.name === 'SequelizeValidationError') {
        return res.status(400).json({
          sucesso: false,
          erro: {
            mensagem: 'Erro de validação',
            detalhes: serviceError.errors.map(err => ({
              campo: err.path,
              mensagem: err.message
            }))
          }
        });
      }
      
      throw serviceError; // Deixa o erro ir para o próximo handler se não for de validação
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /assistidos/{id}:
 *   put:
 *     summary: Atualiza um assistido existente
 *     tags: [Assistidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 maxLength: 100
 *                 minLength: 3
 *                 description: Nome completo do assistido
 *                 example: "Maria Silva Oliveira Santos"
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento (não pode ser futura)
 *                 example: "2015-07-22"
 *               sexo:
 *                 type: string
 *                 enum: ['Feminino', 'Masculino']
 *                 description: Sexo do assistido
 *                 example: "Feminino"
 *               cartaoSus:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número do cartão do SUS
 *                 example: "163704163610004"
 *               rg:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número do RG
 *                 example: "12.345.678-9"
 *               endereco:
 *                 type: string
 *                 maxLength: 255
 *                 description: Logradouro e número
 *                 example: "Rua das Flores, 123"
 *               bairro:
 *                 type: string
 *                 maxLength: 100
 *                 description: Bairro de residência
 *                 example: "Centro"
 *               cep:
 *                 type: string
 *                 maxLength: 9
 *                 pattern: "^\\d{5}-\\d{3}$"
 *                 description: CEP no formato 12345-678
 *                 example: "12345-678"
 *               cidade:
 *                 type: string
 *                 maxLength: 100
 *                 description: Cidade de residência
 *                 example: "São Paulo"
 *               contato:
 *                 type: string
 *                 maxLength: 20
 *                 pattern: "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$"
 *                 description: Telefone no formato (DD) 99999-9999 ou (DD) 9999-9999
 *                 example: "(11) 98765-4321"
 *               pai:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nome completo do pai
 *                 example: "João Oliveira Santos"
 *               mae:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nome completo da mãe
 *                 example: "Ana Silva Oliveira"
 *     responses:
 *       200:
 *         description: Assistido atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAssistido'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Assistido ou responsável(is) não encontrado(s)
 */
export const atualizarAssistido = async (req, res, next) => {
  try {
    const assistidoId = req.params.id;
    const { 
      nome, 
      dataNascimento, 
      sexo,
      cartaoSus,
      rg,
      endereco,
      bairro,
      cep,
      cidade,
      contato,
      problemasSaude,
      pai,
      mae 
    } = req.body;

    const assistidoAtualizado = await AssistidoService.update(assistidoId, { 
      nome, 
      dataNascimento, 
      sexo,
      cartaoSus,
      rg,
      endereco,
      bairro,
      cep,
      cidade,
      contato,
      problemasSaude,
      pai,
      mae
    });
    
    if (!assistidoAtualizado) {
      res.status(404);
      return res.json({ sucesso: false, mensagem: 'Assistido não encontrado' });
    }

    res.status(200);
    res.json({ sucesso: true, dados: assistidoAtualizado });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /assistidos/{id}:
 *   delete:
 *     summary: Remove um assistido
 *     tags: [Assistidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido a ser removido
 *     responses:
 *       204:
 *         description: Assistido removido com sucesso
 *       404:
 *         description: Assistido não encontrado
 */
export const excluirAssistido = async (req, res, next) => {
  try {
    const assistidoId = req.params.id;
    const result = await AssistidoService.remove(assistidoId);
    
    if (result === null) {
      res.status(404);
      return res.json({ sucesso: false, mensagem: 'Assistido não encontrado' });
    }

    res.status(204);
    res.end();
  } catch (error) {
    next(error);
  }
};
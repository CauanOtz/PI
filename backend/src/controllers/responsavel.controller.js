// src/controllers/responsavel.controller.js
import { AssistidoDTO, PaginationDTO } from '../dto/index.js';
import { ok } from '../utils/response.js';
import ResponsavelService from '../services/responsavel.service.js';

/**
 * @openapi
 * /responsaveis/{responsavelId}/assistidos:
 *   get:
 *     summary: Lista os assistidos associados a um responsável específico
 *     tags: [Assistidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responsavelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do responsável
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 'Número da página para paginação.'
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 'Número máximo de itens por página.'
 *     responses:
 *       200:
 *         description: Lista de assistidos retornada com sucesso
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
     *                     assistidos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Assistido'
 *                     paginacao:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         paginaAtual:
 *                           type: integer
 *                         totalPaginas:
 *                           type: integer
 *                         itensPorPagina:
 *                           type: integer
 *                         temProximaPagina:
 *                           type: boolean
 *                         temPaginaAnterior:
 *                           type: boolean
 *       404:
 *         description: Responsável não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 *                 mensagem:
 *                   type: string
 *                   example: 'Responsável não encontrado'
 *       500:
 *         description: Erro interno do servidor
 */
export const listarAssistidosPorResponsavel = async (req, res, next) => {
  try {
    const responsavelId = parseInt(req.params.responsavelId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ResponsavelService.listarAssistidos(responsavelId, { page, limit });
    
    if (result.notFound) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Responsável não encontrado',
      });
    }

    const assistidosDTO = AssistidoDTO.list(result.assistidos, { includeResponsaveis: false });
    const paginacao = new PaginationDTO({
      total: result.pagination.total,
      paginaAtual: result.pagination.page,
      totalPaginas: result.pagination.totalPages,
      itensPorPagina: result.pagination.limit,
    });

    return ok(res, { assistidos: assistidosDTO, paginacao });
  } catch (error) {
    console.error('Erro ao listar assistidos por responsável:', error);
    next(error);
  }
};


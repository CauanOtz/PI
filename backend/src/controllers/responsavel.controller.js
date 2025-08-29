// src/controllers/responsavel.controller.js
import Aluno from '../models/Aluno.model.js';
import Usuario from '../models/Usuario.model.js';

/**
 * @openapi
 * /responsaveis/{responsavelId}/alunos:
 *   get:
 *     summary: Lista os alunos associados a um responsável específico
 *     tags: [Alunos]
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
 *         description: Número da página para paginação (padrão: 1)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número máximo de itens por página (padrão: 10, máximo: 100)
 *     responses:
 *       200:
 *         description: Lista de alunos retornada com sucesso
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
 *                     alunos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Aluno'
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
 *                   example: "Responsável não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */
export const listarAlunosPorResponsavel = async (req, res, next) => {
    try {
        const responsavelId = parseInt(req.params.responsavelId);
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const offset = (page - 1) * limit;

        const responsavel = await Usuario.findByPk(responsavelId);
        if (!responsavel) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Responsável não encontrado',
            });
        }

        const { count, rows: alunos } = await Aluno.findAndCountAll({
            include: [
                {
                    model: Usuario,
                    as: 'responsaveis',
                    // A cláusula 'where' filtra para trazer apenas os alunos associados a este responsável.
                    where: { id: responsavelId },
                    // A cláusula 'attributes: []' é a chave: ela usa a associação para o filtro,
                    // mas impede que os dados dos responsáveis sejam incluídos no resultado final.
                    attributes: [],
                    through: { attributes: [] } // Garante que a tabela de junção também não apareça.
                }
            ],
            limit,
            offset,
            order: [['nome', 'ASC']],
            distinct: true // Essencial para a contagem correta em relacionamentos Many-to-Many
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            sucesso: true,
            dados: {
                // Agora 'alunos' é um array limpo, sem a lista aninhada de 'responsaveis'.
                alunos: alunos,
                paginacao: {
                    total: count,
                    paginaAtual: page,
                    totalPaginas: totalPages,
                    itensPorPagina: limit,
                    temProximaPagina: page < totalPages,
                    temPaginaAnterior: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Erro ao listar alunos por responsável:', error);
        next(error);
    }
};
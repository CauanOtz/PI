// src/services/responsavel.service.js
import Aluno from '../models/Aluno.model.js';
import Usuario from '../models/Usuario.model.js';

class ResponsavelService {
  /**
   * Lista os alunos associados a um responsável específico
   * @param {number} responsavelId - ID do responsável
   * @param {Object} pagination - Opções de paginação
   * @param {number} pagination.page - Número da página
   * @param {number} pagination.limit - Itens por página
   * @returns {Promise<Object>} Objeto com alunos e informações de paginação
   */
  async listarAlunos(responsavelId, { page = 1, limit = 10 } = {}) {
    const responsavel = await Usuario.findByPk(responsavelId);
    if (!responsavel) {
      return { notFound: true };
    }

    // Valida e ajusta os parâmetros de paginação
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));
    const offset = (page - 1) * limit;

    const { count, rows: alunos } = await Aluno.findAndCountAll({
      include: [
        {
          model: Usuario,
          as: 'responsaveis',
          where: { id: responsavelId },
          attributes: [],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      order: [['nome', 'ASC']],
      distinct: true,
    });

    return {
      alunos,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
    };
  }
}

export default new ResponsavelService();
// src/controllers/responsavel.controller.js
import { AssistidoDTO, PaginationDTO } from '../dto/index.js';
import { ok } from '../utils/response.js';
import ResponsavelService from '../services/responsavel.service.js';

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


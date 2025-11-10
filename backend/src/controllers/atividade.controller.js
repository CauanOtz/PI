// src/controllers/atividade.controller.js
import { AtividadeDTO } from '../dto/index.js';
import { ok, created } from '../utils/response.js';
import AtividadeService from '../services/atividade.service.js';

/**
 * @openapi
 * /atividades:
 *   get:
 *     summary: Lista todas as atividades
 *     tags: [Atividades]
 *     responses:
 *       200:
 *         description: Lista de atividades recuperada com sucesso
 */
export const listarAtividades = async (req, res, next) => {
  try {
    const atividades = await AtividadeService.listAll();
    const atividadesDTO = atividades.map((a) => AtividadeDTO.from(a));
    return ok(res, { atividades: atividadesDTO });
  } catch (error) {
    next(error);
  }
};

export const criarAtividade = async (req, res, next) => {
  try {
    const { titulo, data, horario, descricao } = req.body;
    const novaAtividade = await AtividadeService.create({ titulo, data, horario, descricao });
    return created(res, AtividadeDTO.from(novaAtividade));
  } catch (error) {
    next(error);
  }
};

export const getAtividadePorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const atividade = await AtividadeService.getById(id);
    return ok(res, AtividadeDTO.from(atividade));
  } catch (error) {
    next(error);
  }
};

export const atualizarAtividade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, data, horario, descricao } = req.body;

    const atividadeAtualizada = await AtividadeService.update(id, { titulo, data, horario, descricao });
    if (!atividadeAtualizada) {
      return res.status(404).json({ message: "Atividade não encontrada." });
    }
    return ok(res, AtividadeDTO.from(atividadeAtualizada));
  } catch (error) {
    next(error);
  }
};

export const excluirAtividade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AtividadeService.remove(id);
    if (result === null) {
      return res.status(404).json({ message: "Atividade não encontrada." });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

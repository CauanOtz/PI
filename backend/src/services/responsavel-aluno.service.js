// src/services/responsavel-aluno.service.js
import ResponsavelAluno from '../models/ResponsavelAluno.model.js';
import Usuario from '../models/Usuario.model.js';
import Aluno from '../models/Aluno.model.js';

class ResponsavelAlunoService {
  /**
   * Vincula um responsável a um aluno
   * @param {number} idUsuario - ID do responsável
   * @param {number} idAluno - ID do aluno
   * @returns {Promise<Object>} Resultado da operação
   */
  async vincular(idUsuario, idAluno) {
    // Verifica se o usuário existe e é um responsável
    const usuario = await Usuario.findOne({
      where: { 
        id: idUsuario,
        role: 'responsavel' 
      }
    });

    if (!usuario) {
      return { notFound: true, message: 'Responsável não encontrado ou não tem permissão' };
    }

    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(idAluno);
    if (!aluno) {
      return { notFound: true, message: 'Aluno não encontrado' };
    }

    // Verifica se o vínculo já existe
    const vinculoExistente = await ResponsavelAluno.findOne({
      where: { id_usuario: idUsuario, id_aluno: idAluno }
    });

    if (vinculoExistente) {
      return { conflict: true, message: 'Este responsável já está vinculado a este aluno' };
    }

    // Cria o vínculo
    const vinculo = await ResponsavelAluno.create({
      id_usuario: idUsuario,
      id_aluno: idAluno
    });

    return { vinculo };
  }

  /**
   * Desvincula um responsável de um aluno
   * @param {number} idUsuario - ID do responsável
   * @param {number} idAluno - ID do aluno
   * @returns {Promise<Object>} Resultado da operação
   */
  async desvincular(idUsuario, idAluno) {
    // Verifica se o vínculo existe
    const vinculo = await ResponsavelAluno.findOne({
      where: { 
        id_usuario: idUsuario,
        id_aluno: idAluno
      }
    });

    if (!vinculo) {
      return { notFound: true, message: 'Vínculo não encontrado' };
    }

    // Remove o vínculo
    await vinculo.destroy();
    return { success: true };
  }
}

export default ResponsavelAlunoService;
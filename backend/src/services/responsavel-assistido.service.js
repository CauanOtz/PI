// src/services/responsavel-assistido.service.js
import ResponsavelAssistido from '../models/ResponsavelAssistido.model.js';
import Usuario from '../models/Usuario.model.js';
import Assistido from '../models/Assistido.model.js';

class ResponsavelAssistidoService {
  /**
   * Vincula um responsável a um assistido
   * @param {number} idUsuario - ID do responsável
   * @param {number} idAssistido - ID do assistido
   * @returns {Promise<Object>} Resultado da operação
   */
  async vincular(idUsuario, idAssistido) {
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

    // Verifica se o assistido existe
    const assistido = await Assistido.findByPk(idAssistido);
    if (!assistido) {
      return { notFound: true, message: 'Assistido não encontrado' };
    }

    // Verifica se o vínculo já existe
    const vinculoExistente = await ResponsavelAssistido.findOne({
      where: { id_usuario: idUsuario, id_assistido: idAssistido }
    });

    if (vinculoExistente) {
      return { conflict: true, message: 'Este responsável já está vinculado a este assistido' };
    }

    // Cria o vínculo
    const vinculo = await ResponsavelAssistido.create({
      id_usuario: idUsuario,
      id_assistido: idAssistido
    });

    return { vinculo };
  }

  /**
   * Desvincula um responsável de um assistido
   * @param {number} idUsuario - ID do responsável
   * @param {number} idAssistido - ID do assistido
   * @returns {Promise<Object>} Resultado da operação
   */
  async desvincular(idUsuario, idAssistido) {
    // Verifica se o vínculo existe
    const vinculo = await ResponsavelAssistido.findOne({
      where: { 
        id_usuario: idUsuario,
        id_assistido: idAssistido
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

export default ResponsavelAssistidoService;
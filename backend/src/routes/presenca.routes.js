import { Router } from 'express';
import { requireAdmin } from '../middlewares/authorization.middleware.js';
import { validateIdParam } from '../middlewares/validators/param.validator.js';
import { 
  registrarPresenca, 
  listarPresencas, 
  obterPresenca, 
  atualizarPresenca,
  listarPresencasPorAtividade,
  listarHistoricoAssistido,
  registrarPresencasBulk
} from '../controllers/presenca.controller.js';
import Presenca from '../models/Presenca.model.js';
import { 
  validateRegistrarPresenca, 
  validateListarPresencas, 
  validateObterPresenca, 
  validateAtualizarPresenca,
  validatePresencasPorAtividade,
  validateHistoricoAssistido
} from '../middlewares/validators/presenca.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', 
  autenticar, 
  validateRegistrarPresenca, 
  registrarPresenca
);

router.get('/', 
  autenticar, 
  validateListarPresencas, 
  listarPresencas
);

router.get('/atividades/:idAtividade', 
  autenticar, 
  validatePresencasPorAtividade,
  listarPresencasPorAtividade
);

router.get('/assistidos/:idAssistido', 
  autenticar, 
  validateHistoricoAssistido,
  listarHistoricoAssistido
);

router.get('/:id', validateIdParam('id'), 
  autenticar, 
  validateObterPresenca, 
  obterPresenca
);

router.put('/:id', 
  validateIdParam('id'),  
  autenticar, 
  requireAdmin, 
  validateAtualizarPresenca, 
  atualizarPresenca
);

router.delete('/:id', 
  validateIdParam('id'), 
  autenticar,
  validateObterPresenca,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const presenca = await Presenca.findByPk(id);
      
      if (!presenca) {
        return res.status(404).json({ message: 'Registro de Presença não encontrado' });
      }
      
      await presenca.destroy();
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

router.post('/bulk', 
  autenticar, 
  requireAdmin,
  registrarPresencasBulk
);

export default router;

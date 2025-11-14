// src/routes/responsavel.routes.js
import { Router } from 'express';
import * as responsavelController from '../controllers/responsavel.controller.js';
import { validateResponsavelId } from '../middlewares/validators/responsavel.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

router.get(
  '/:responsavelId/assistidos', 
  autenticar, 
  validateResponsavelId, 
  responsavelController.listarAssistidosPorResponsavel
);

export default router;
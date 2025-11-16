// src/middlewares/validators/assistido.validator.js
import { body, param, validationResult } from 'express-validator';

// Middleware genérico para lidar com os erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ 
      sucesso: false,
      mensagem: 'Erro de validação',
      erros: errorMessages 
    });
  }
  next();
};

// Validações comuns que podem ser reutilizadas
const nomeValidation = body('nome')
  .trim()
  .notEmpty().withMessage('O nome é obrigatório.')
  .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.');

const dataNascimentoValidation = body('dataNascimento')
  .notEmpty().withMessage('A data de nascimento é obrigatória.')
  .isISO8601().withMessage('Data de nascimento inválida. Use o formato YYYY-MM-DD.')
  .custom((value) => {
    if (new Date(value) > new Date()) {
      throw new Error('A data de nascimento não pode ser no futuro.');
    }
    return true;
  });

const sexoValidation = body('sexo')
  .notEmpty().withMessage('O sexo é obrigatório.')
  .isIn(['Feminino', 'Masculino']).withMessage('O sexo deve ser Feminino ou Masculino.');

const cartaoSusValidation = body('cartaoSus')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 20 }).withMessage('O cartão SUS não pode ter mais de 20 caracteres.');

const rgValidation = body('rg')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 20 }).withMessage('O RG não pode ter mais de 20 caracteres.');

// Validações para endereço normalizado (objeto)
const enderecoValidation = body('endereco')
  .optional()
  .custom((value) => {
    // Se fornecido, deve ser um objeto
    if (value && typeof value !== 'object') {
      throw new Error('O endereço deve ser um objeto.');
    }
    return true;
  });

const enderecoCepValidation = body('endereco.cep')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 20 }).withMessage('O CEP não pode ter mais de 20 caracteres.');

const enderecoLogradouroValidation = body('endereco.logradouro')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 255 }).withMessage('O logradouro não pode ter mais de 255 caracteres.');

const enderecoBairroValidation = body('endereco.bairro')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 100 }).withMessage('O bairro não pode ter mais de 100 caracteres.');

const enderecoCidadeValidation = body('endereco.cidade')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 100 }).withMessage('A cidade não pode ter mais de 100 caracteres.');

const enderecoEstadoValidation = body('endereco.estado')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 2 }).withMessage('O estado deve ter 2 caracteres (UF).');

// Validação para numero e complemento (campos diretos no assistido)
const numeroValidation = body('numero')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 20 }).withMessage('O número não pode ter mais de 20 caracteres.');

const complementoValidation = body('complemento')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 100 }).withMessage('O complemento não pode ter mais de 100 caracteres.');

// Validações antigas removidas (não usadas mais)
const bairroValidation = body('bairro')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 100 }).withMessage('O bairro não pode ter mais de 100 caracteres.');

const cepValidation = body('cep')
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^\d{5}-\d{3}$/).withMessage('O CEP deve estar no formato 12345-678.');

const cidadeValidation = body('cidade')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 100 }).withMessage('A cidade não pode ter mais de 100 caracteres.');

// Validações para contatos (array)
const contatosValidation = body('contatos')
  .optional()
  .isArray().withMessage('Contatos deve ser um array.');

// Validações para filiação (objeto)
const filiacaoValidation = body('filiacao')
  .optional()
  .custom((value) => {
    if (value && typeof value !== 'object') {
      throw new Error('A filiação deve ser um objeto.');
    }
    return true;
  });

const contatoValidation = body('contato')
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
  .withMessage('O telefone deve estar no formato (DD) 99999-9999 ou (DD) 9999-9999.');

const problemasSaudeValidation = body('problemasSaude')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 1000 }).withMessage('A descrição dos problemas de saúde não pode ter mais de 1000 caracteres.');

const paiValidation = body('pai')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 100 }).withMessage('O nome do pai não pode ter mais de 100 caracteres.');

const maeValidation = body('mae')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 100 }).withMessage('O nome da mãe não pode ter mais de 100 caracteres.');

// Middleware para validação de criação de assistido
export const validateCreateAssistido = [
  nomeValidation,
  dataNascimentoValidation,
  sexoValidation,
  cartaoSusValidation,
  rgValidation,
  enderecoValidation,
  enderecoCepValidation,
  enderecoLogradouroValidation,
  enderecoBairroValidation,
  enderecoCidadeValidation,
  enderecoEstadoValidation,
  numeroValidation,
  complementoValidation,
  contatosValidation,
  filiacaoValidation,
  problemasSaudeValidation,
  handleValidationErrors,
];

// Middleware para validação de atualização de assistido
export const validateUpdateAssistido = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.'),
  body('dataNascimento')
    .optional()
    .isISO8601().withMessage('Data de nascimento inválida. Use o formato YYYY-MM-DD.')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('A data de nascimento não pode ser no futuro.');
      }
      return true;
    }),
  body('sexo')
    .optional()
    .isIn(['Feminino', 'Masculino']).withMessage('O sexo deve ser Feminino ou Masculino.'),
  cartaoSusValidation,
  rgValidation,
  enderecoValidation,
  enderecoCepValidation,
  enderecoLogradouroValidation,
  enderecoBairroValidation,
  enderecoCidadeValidation,
  enderecoEstadoValidation,
  numeroValidation,
  complementoValidation,
  contatosValidation,
  filiacaoValidation,
  problemasSaudeValidation,
  handleValidationErrors,
];

// Middleware para validar o ID do assistido nos parâmetros da rota
export const validateAssistidoId = [
  param('id')
    .isInt({ min: 1 }).withMessage('O ID do assistido deve ser um número inteiro positivo.'),
  handleValidationErrors,
];

// Middleware para validação de consulta (query params)
export const validateListarAssistidos = [
  param('page').optional().isInt({ min: 1 }).withMessage('A página deve ser um número inteiro positivo.'),
  param('limit').optional().isInt({ min: 1, max: 100 }).withMessage('O limite deve ser um número entre 1 e 100.'),
  param('search').optional().trim().isString().withMessage('O termo de busca deve ser um texto.'),
  param('responsavel_id').optional().isInt({ min: 1 }).withMessage('O ID do responsável deve ser um número inteiro positivo.'),
  handleValidationErrors,
];
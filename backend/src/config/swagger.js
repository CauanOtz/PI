// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import basicAuth from 'express-basic-auth';

const setupSwagger = (app) => {
  const users = {};
  if (process.env.SWAGGER_USER && process.env.SWAGGER_PASS) {
    users[process.env.SWAGGER_USER] = process.env.SWAGGER_PASS;
  }

  const maybeAuth = Object.keys(users).length ? [basicAuth({ users, challenge: true })] : [];

  const port = Number(process.env.PORT) || 3001;
  const serverUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}/api/v2`;

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Diario de Classe',
        version: '2.0.0',
        description: 'Documentacao da API do Diario de Classe.',
      },
      servers: [
        { url: serverUrl, description: 'Servidor de Desenvolvimento' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Insira o token JWT no formato: Bearer <token>',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              mensagem: { type: 'string', example: 'Mensagem de erro' },
              erros: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    campo: { type: 'string', example: 'email' },
                    mensagem: { type: 'string', example: 'Formato invalido' },
                  },
                },
              },
            },
          },
          PaginationDTO: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              paginaAtual: { type: 'integer' },
              totalPaginas: { type: 'integer' },
              itensPorPagina: { type: 'integer' },
              temProximaPagina: { type: 'boolean' },
              temPaginaAnterior: { type: 'boolean' },
            },
          },
          UsuarioDTO: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              nome: { type: 'string' },
              email: { type: 'string', format: 'email' },
              telefone: { type: 'string', nullable: true },
              cpf: { type: 'string' },
              role: { type: 'string', enum: ['admin','responsavel'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          DocumentoDTO: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              nome: { type: 'string' },
              descricao: { type: 'string', nullable: true },
              tipo: { type: 'string', enum: ['RG','CPF','CERTIDAO_NASCIMENTO','COMPROVANTE_ENDERECO','OUTRO'] },
              tamanho: { type: 'integer', nullable: true },
              alunoId: { type: 'integer' },
              usuarioId: { type: 'integer' },
              dataUpload: { type: 'string', format: 'date-time' },
              downloadUrl: { type: 'string' },
            },
          },
          AulaDTO: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              titulo: { type: 'string' },
              data: { type: 'string', format: 'date' },
              horario: { type: 'string' },
              descricao: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          PresencaDTO: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              idAluno: { type: 'integer' },
              idAula: { type: 'integer' },
              status: { type: 'string', enum: ['presente','falta','atraso','falta_justificada'] },
              dataRegistro: { type: 'string', format: 'date' },
              observacao: { type: 'string', nullable: true },
            },
          },
          NotificacaoDTO: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              titulo: { type: 'string' },
              mensagem: { type: 'string' },
              tipo: { type: 'string', enum: ['info','alerta','urgente','sistema'] },
              dataExpiracao: { type: 'string', format: 'date-time', nullable: true },
              criadoPor: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          // Envelopes padrao
          SuccessUsuario: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: { $ref: '#/components/schemas/UsuarioDTO' },
            },
          },
          SuccessUsuarios: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: {
                type: 'object',
                properties: {
                  usuarios: { type: 'array', items: { $ref: '#/components/schemas/UsuarioDTO' } },
                  paginacao: { $ref: '#/components/schemas/PaginationDTO' },
                },
              },
            },
          },
          SuccessDocumento: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: { $ref: '#/components/schemas/DocumentoDTO' },
            },
          },
          SuccessDocumentos: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: {
                type: 'object',
                properties: {
                  documentos: { type: 'array', items: { $ref: '#/components/schemas/DocumentoDTO' } },
                },
              },
            },
          },
          SuccessAula: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: { $ref: '#/components/schemas/AulaDTO' },
            },
          },
          SuccessAulas: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: {
                type: 'object',
                properties: {
                  aulas: { type: 'array', items: { $ref: '#/components/schemas/AulaDTO' } },
                },
              },
            },
          },
          SuccessPresenca: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: { $ref: '#/components/schemas/PresencaDTO' },
            },
          },
          SuccessPresencas: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: {
                type: 'object',
                properties: {
                  presencas: { type: 'array', items: { $ref: '#/components/schemas/PresencaDTO' } },
                },
              },
            },
          },
          SuccessNotificacao: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: { $ref: '#/components/schemas/NotificacaoDTO' },
            },
          },
          SuccessNotificacoes: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: {
                type: 'object',
                properties: {
                  notificacoes: { type: 'array', items: { $ref: '#/components/schemas/NotificacaoDTO' } },
                  paginacao: { $ref: '#/components/schemas/PaginationDTO' },
                },
              },
            },
          },
        },
        responses: {
          UnauthorizedError: {
            description: 'Token de acesso ausente ou invalido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { mensagem: 'Token nao fornecido' },
              },
            },
          },
          ForbiddenError: {
            description: 'Acesso negado. Apenas administradores podem acessar este recurso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { mensagem: 'Acesso negado' },
              },
            },
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
  };

  const swaggerSpec = swaggerJsdoc(options);

  app.use(
    '/api-docs',
    ...maybeAuth,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'API Diario de Classe - Documentacao',
      customCss: `
        .topbar { background-color: #1e3a8a !important; }
        .swagger-ui .info .title { color: #1e3a8a; }
        .swagger-ui .opblock-tag { color: #1e3a8a; }
      `,
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showCommonExtensions: true,
      },
    })
  );
  // eslint-disable-next-line no-console
  console.log(`Documentacao da API disponivel em http://localhost:${port}/api-docs`);
};

export default setupSwagger;


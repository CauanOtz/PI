// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Diario de Classe',
      version: '1.0.0',
      description: 'Documentação da API para o sistema de Diario de Classe.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT no formato: Bearer <token>'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nome: {
              type: 'string',
              example: 'João da Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@escola.com'
            },
            telefone: {
              type: 'string',
              example: '(11) 98765-4321'
            },
            cpf: {
              type: 'string',
              example: '123.456.789-09'
            },
            role: {
              type: 'string',
              enum: ['admin', 'responsavel'],
              example: 'responsavel'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            mensagem: {
              type: 'string',
              example: 'Mensagem de erro descritiva'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  param: { type: 'string' },
                  location: { type: 'string' }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso ausente ou inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                mensagem: 'Token não fornecido'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acesso negado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                mensagem: 'Acesso negado. Apenas administradores podem acessar este recurso.'
              }
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "API Diário de Classe - Documentação",
      customCss: `
        .topbar { background-color: #1e3a8a !important; }
        .swagger-ui .info .title { color: #1e3a8a; }
        .swagger-ui .opblock-tag { color: #1e3a8a; }
      `,
      swaggerOptions: {
        defaultModelsExpandDepth: -1, // Esconde os schemas por padrão
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showCommonExtensions: true
      }
    })
  );
  console.log(`Documentação da API disponível em http://localhost:${process.env.PORT || 3000}/api-docs`);
};

export default setupSwagger;
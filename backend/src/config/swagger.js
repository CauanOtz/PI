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
              assistidoId: { type: 'integer' },
              usuarioId: { type: 'integer' },
              dataUpload: { type: 'string', format: 'date-time' },
              ativo: { type: 'boolean' },
              downloadUrl: { type: 'string' },
            },
          },
          Atividade: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              titulo: { type: 'string', maxLength: 100, minLength: 3 },
              data: { type: 'string', format: 'date' },
              horario: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)(?::([0-5]\\d))?$' },
              descricao: { type: 'string', nullable: true, maxLength: 500 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
            required: ['titulo', 'data', 'horario']
          },
          NovaAtividade: {
            type: 'object',
            properties: {
              titulo: { type: 'string', maxLength: 100, minLength: 3, example: "Matemática Básica" },
              data: { type: 'string', format: 'date', example: "2025-11-08" },
              horario: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)(?::([0-5]\\d))?$', example: "14:30" },
              descricao: { type: 'string', nullable: true, maxLength: 500, example: "Atividade introdutória sobre conceitos básicos" }
            },
            required: ['titulo', 'data', 'horario']
          },
          PresencaDTO: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              idAssistido: { type: 'integer' },
              idAula: { type: 'integer' },
              status: { type: 'string', enum: ['presente','falta','atraso','falta_justificada'] },
              dataRegistro: { type: 'string', format: 'date' },
              observacao: { type: 'string', nullable: true },
            },
          },
          Assistido: {
            type: 'object',
            example: {
              "nome": "Maria Silva Oliveira",
              "dataNascimento": "2015-07-22",
              "sexo": "Feminino",
              "cartaoSus": "163704163610004",
              "rg": "12.345.678-9",
              "endereco": {
                "cep": "01310-100",
                "logradouro": "Avenida Paulista",
                "bairro": "Bela Vista",
                "cidade": "São Paulo",
                "estado": "SP"
              },
              "numero": "1578",
              "complemento": "Apto 501",
              "contatos": [
                {
                  "telefone": "(11) 98765-4321",
                  "nomeContato": "Ana Silva",
                  "parentesco": "Mãe",
                  "ordemPrioridade": 1
                },
                {
                  "telefone": "(11) 91234-5678",
                  "nomeContato": "João Santos",
                  "parentesco": "Pai",
                  "ordemPrioridade": 2
                }
              ],
              "filiacao": {
                "mae": "Ana Silva Santos",
                "pai": "João Pedro Santos"
              },
              "problemasSaude": "Alergia a lactose"
            },
            properties: {
              id: { type: 'integer', readOnly: true },
              nome: { type: 'string', maxLength: 100, minLength: 3 },
              dataNascimento: { type: 'string', format: 'date' },
              sexo: { type: 'string', enum: ['Feminino', 'Masculino'] },
              cartaoSus: { type: 'string', maxLength: 20, nullable: true },
              rg: { type: 'string', maxLength: 20, nullable: true },
              endereco: {
                type: 'object',
                nullable: true,
                properties: {
                  cep: { type: 'string', maxLength: 9 },
                  logradouro: { type: 'string', maxLength: 255, nullable: true },
                  bairro: { type: 'string', maxLength: 100, nullable: true },
                  cidade: { type: 'string', maxLength: 100, nullable: true },
                  estado: { type: 'string', maxLength: 2, nullable: true }
                }
              },
              numero: { type: 'string', maxLength: 20, nullable: true },
              complemento: { type: 'string', maxLength: 100, nullable: true },
              contatos: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  required: ['telefone'],
                  properties: {
                    telefone: { type: 'string', maxLength: 20 },
                    nomeContato: { type: 'string', maxLength: 100, nullable: true },
                    parentesco: { type: 'string', maxLength: 50, nullable: true },
                    observacao: { type: 'string', maxLength: 255, nullable: true },
                    ordemPrioridade: { type: 'integer', default: 1 }
                  }
                }
              },
              filiacao: {
                type: 'object',
                nullable: true,
                properties: {
                  mae: { type: 'string', maxLength: 100, nullable: true },
                  pai: { type: 'string', maxLength: 100, nullable: true }
                }
              },
              problemasSaude: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time', readOnly: true },
              updatedAt: { type: 'string', format: 'date-time', readOnly: true }
            },
            required: ['nome', 'dataNascimento', 'sexo', 'contatos']
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
          SuccessAtividade: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: { $ref: '#/components/schemas/Atividade' },
            },
          },
          SuccessAtividades: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: {
                type: 'object',
                properties: {
                  atividades: { type: 'array', items: { $ref: '#/components/schemas/Atividade' } },
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
          SuccessAssistido: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: {
                type: 'object',
                properties: {
                  assistido: { $ref: '#/components/schemas/Assistido' }
                }
              },
            },
          },
          SuccessAssistidos: {
            type: 'object',
            properties: {
              sucesso: { type: 'boolean', example: true },
              dados: {
                type: 'object',
                properties: {
                  assistidos: { type: 'array', items: { $ref: '#/components/schemas/Assistido' } },
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


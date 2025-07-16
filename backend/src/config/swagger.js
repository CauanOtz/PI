// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0', // Versão do OpenAPI
    info: {
      title: 'API do Diario de Classe',
      version: '1.0.0',
      description: 'Documentação da API para o sistema de Diario de Classe.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`, // URL base da sua API
        description: 'Servidor de Desenvolvimento',
      },
    ],
    // (Opcional) Adicionar componentes globais como esquemas de segurança (ex: JWT)
    components: {
      securitySchemes: {
        bearerAuth: { // Nome do esquema de segurança
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT no formato: Bearer <token>'
        }
      }
    },
    security: [{ // Aplica o esquema de segurança globalmente (opcional)
      bearerAuth: []
    }]
  },
  // Caminho para os arquivos contendo as anotações OpenAPI (JSDoc)
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'], // Ajuste os caminhos conforme sua estrutura
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    // (Opcional) Customizações da UI do Swagger
    // customCss: '.swagger-ui .topbar { display: none }',
    // customSiteTitle: "Documentação API Escola",
  }));
  console.log(`Documentação da API disponível em http://localhost:${process.env.PORT || 3000}/api-docs`);
};

export default setupSwagger;
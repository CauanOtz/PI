// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import basicAuth from 'express-basic-auth';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Diário de Classe',
      version: '2.0.0',
      description: 'Documentação da API para o sistema de Diário de Classe.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v2`,
        description: 'Servidor de Desenvolvimento',
      },
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
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  const users = {};
  if (process.env.SWAGGER_USER && process.env.SWAGGER_PASS) {
    users[process.env.SWAGGER_USER] = process.env.SWAGGER_PASS;
  }

  const maybeAuth = Object.keys(users).length ? [basicAuth({ users, challenge: true })] : [];

  app.use(
    '/api-docs',
    ...maybeAuth,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'API Diário de Classe - Documentação',
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

  console.log(`Documentação da API disponível em http://localhost:${process.env.PORT || 3000}/api-docs`);
};

export default setupSwagger;


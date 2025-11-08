import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WorkLife Dashboard API',
      version: '1.0.0',
      description: 'WorkLife Dashboard REST API documentation',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5001',
      },
    ],
  },
  apis: ['src/docs/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

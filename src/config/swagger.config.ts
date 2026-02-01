import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bites API',
      version: '1.0.0',
      description: 'A restaurant and cuisine review API built with Express and Redis',
      contact: {
        name: 'API Support',
        email: 'support@bites.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Restaurant: {
          type: 'object',
          required: ['name', 'location', 'cuisines'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique restaurant identifier',
              readOnly: true,
            },
            name: {
              type: 'string',
              description: 'Restaurant name',
              example: 'The Italian Place',
            },
            location: {
              type: 'string',
              description: 'Restaurant location',
              example: '123 Main St, New York, NY',
            },
            cuisines: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of cuisine types',
              example: ['italian', 'pizza'],
            },
          },
        },
        Review: {
          type: 'object',
          required: ['review', 'rating'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique review identifier',
              readOnly: true,
            },
            review: {
              type: 'string',
              description: 'Review text',
              example: 'Amazing food and great service!',
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 10,
              description: 'Rating from 1 to 10',
              example: 8,
            },
            timestamp: {
              type: 'number',
              description: 'Review timestamp',
              readOnly: true,
            },
            restaurantId: {
              type: 'string',
              description: 'Restaurant ID',
              readOnly: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options);
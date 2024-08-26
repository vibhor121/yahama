const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management App',
      version: '1.0.0',
      description: 'API documentation for the Event Management App, providing endpoints for managing events, users, and other related resources.',
      contact: {
        name: 'Support Team',
        email: 'support@eventmanagementapp.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://localhost:8080',
        description: 'Local Development Server',
      },
      {
        url: 'https://api.eventmanagementapp.com',
        description: 'Production Server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Adjust the path according to your project structure
};

const openapiSpecification = swaggerJsdoc(options);
module.exports = openapiSpecification;

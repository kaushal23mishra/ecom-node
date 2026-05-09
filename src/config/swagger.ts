const packageJson = require('../../package.json');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node DHI API',
            version: packageJson.version,
            description: 'Enterprise Node.js API Documentation',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5001}`,
                description: 'Development Server',
            },
            {
                url: 'https://api.production.com',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                },
                NotFoundError: {
                    description: 'The requested resource was not found',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Paths to files containing OpenAPI definitions
    // These paths are relative to the root when running ts-node from root
    apis: [
        './docs/api_all.yml',
        './src/routes/*.ts',
        './src/routes/**/*.ts',
        './src/controller/**/*.ts',
    ],
};

export = options;

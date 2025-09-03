import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config/environment';

export const initializeSwagger = (app: any) => {
    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'User Management API',
                version: '1.0.0',
                description: 'A RESTful API for managing users with MongoDB',
            },
            servers: [
                {
                    url: `http://localhost:${config.PORT}/api/v1`,
                    description: 'Development server'
                }
            ],
            tags: [
                {
                    name: 'Users',
                    description: 'User management endpoints'
                }
            ],
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'User unique identifier'
                            },
                            name: {
                                type: 'string',
                                description: 'User full name'
                            },
                            email: {
                                type: 'string',
                                format: 'email',
                                description: 'User email address'
                            },
                            age: {
                                type: 'integer',
                                description: 'User age in years'
                            },
                            createdAt: {
                                type: 'string',
                                format: 'date-time',
                                description: 'User creation timestamp'
                            },
                            updatedAt: {
                                type: 'string',
                                format: 'date-time',
                                description: 'User last update timestamp'
                            }
                        }
                    },
                    Error: {
                        type: 'object',
                        properties: {
                            success: {
                                type: 'boolean',
                                example: false
                            },
                            error: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string'
                                    },
                                    details: {
                                        type: 'array',
                                        items: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    Success: {
                        type: 'object',
                        properties: {
                            success: {
                                type: 'boolean',
                                example: true
                            },
                            message: {
                                type: 'string'
                            },
                            data: {
                                type: 'object'
                            }
                        }
                    }
                }
            }
        },
        apis: ['./src/routes/*.ts']
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get('/api-docs.json', (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

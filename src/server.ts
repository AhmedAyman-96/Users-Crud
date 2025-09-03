import express, { Application, Request, Response } from 'express';
import { config } from './config/environment';
import { database } from './config/database';
import { redis } from './config/redis';
import { handleValidationError } from './middleware/validation';
import { initializeCommonMiddleware } from './middleware/common';
import { initializeSwagger } from './middleware/swagger';
import { initializeErrorHandling } from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';

class Server {
    private app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddleware();
        this.initializeSwagger();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddleware(): void {
        initializeCommonMiddleware(this.app);
    }

    private initializeRoutes(): void {
        this.app.use('/api/v1', userRoutes);

        this.app.get('/', (req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: 'User Management API',
                version: '1.0.0',
                documentation: '/api-docs'
            });
        });

        this.app.use((req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.originalUrl} not found`
            });
        });
    }

    private initializeSwagger(): void {
        initializeSwagger(this.app);
    }

    private initializeErrorHandling(): void {
        this.app.use(handleValidationError);
        initializeErrorHandling(this.app);
    }

    public async start(): Promise<void> {
        try {
            await Promise.all([
                database.connect(),
                redis.connect()
            ]);

            console.log('Configuration:', config.getAllConfig());

            this.app.listen(config.PORT, () => {
                console.log(`Server is running on port ${config.PORT}`);
                console.log(`API Documentation: http://localhost:${config.PORT}/api-docs`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    public async stop(): Promise<void> {
        try {
            await Promise.all([
                database.disconnect(),
                redis.disconnect()
            ]);
            console.log('Server stopped gracefully');
        } catch (error) {
            console.error('Error stopping server:', error);
        }
    }

    public getApp(): Application {
        return this.app;
    }
}

export const server = new Server();

process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
});

if (require.main === module) {
    server.start().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export const initializeErrorHandling = (app: any) => {
    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
        console.error('Unhandled error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors
                }
            });
            return;
        }

        if (error.code === 11000) {
            res.status(409).json({
                success: false,
                error: {
                    message: 'Duplicate key error',
                    details: ['A record with this value already exists']
                }
            });
            return;
        }

        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';

        res.status(statusCode).json({
            success: false,
            error: {
                message: config.isDevelopment() ? message : 'Internal server error'
            }
        });
    });
};

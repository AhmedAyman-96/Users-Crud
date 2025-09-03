import dotenv from 'dotenv';

export class EnvironmentConfig {
    public readonly PORT: number;
    public readonly NODE_ENV: string;
    public readonly MONGODB_URI: string;
    public readonly REDIS_URL: string;
    public readonly CACHE_TTL_SECONDS: number;

    constructor() {
        dotenv.config();

        this.PORT = parseInt(process.env.PORT || '3000', 10);
        this.NODE_ENV = process.env.NODE_ENV || 'development';
        this.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
        this.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
        this.CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '3', 10);

        this.validateConfiguration();
    }

    private validateConfiguration(): void {
        const requiredVars = ['MONGODB_URI', 'REDIS_URL'];

        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
            console.log('Using default values for missing variables');
        }

        if (isNaN(this.PORT) || this.PORT < 1 || this.PORT > 65535) {
            throw new Error(`Invalid PORT: ${this.PORT}. Must be a number between 1 and 65535`);
        }

        if (this.CACHE_TTL_SECONDS < 1) {
            throw new Error(`Invalid CACHE_TTL_SECONDS: ${this.CACHE_TTL_SECONDS}. Must be at least 1 second`);
        }
    }

    public isProduction(): boolean {
        return this.NODE_ENV === 'production';
    }

    public isDevelopment(): boolean {
        return this.NODE_ENV === 'development';
    }

    public getAllConfig(): Record<string, any> {
        return {
            PORT: this.PORT,
            NODE_ENV: this.NODE_ENV,
            MONGODB_URI: this.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'),
            REDIS_URL: this.REDIS_URL.replace(/\/\/.*@/, '//***:***@'),
            CACHE_TTL_SECONDS: this.CACHE_TTL_SECONDS
        };
    }
}

export const config = new EnvironmentConfig();

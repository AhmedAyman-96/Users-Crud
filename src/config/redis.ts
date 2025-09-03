import { createClient, RedisClientType } from 'redis';

export class RedisConfig {
    private static instance: RedisConfig;
    private client: RedisClientType | null = null;
    private isConnected: boolean = false;

    private constructor() { }

    public static getInstance(): RedisConfig {
        if (!RedisConfig.instance) {
            RedisConfig.instance = new RedisConfig();
        }
        return RedisConfig.instance;
    }

    public async connect(url: string = process.env.REDIS_URL || 'redis://localhost:6379'): Promise<void> {
        try {
            if (this.isConnected && this.client) {
                console.log('Redis already connected');
                return;
            }

            this.client = createClient({
                url: url,
                socket: {
                    connectTimeout: 60000,
                },
            });

            this.client.on('error', (error) => {
                console.error('Redis connection error:', error);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('Successfully connected to Redis');
                this.isConnected = true;
            });

            this.client.on('ready', () => {
                console.log('Redis client ready');
            });

            this.client.on('end', () => {
                console.log('Redis connection ended');
                this.isConnected = false;
            });

            await this.client.connect();

        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.quit();
                this.isConnected = false;
                console.log('Successfully disconnected from Redis');
            }
        } catch (error) {
            console.error('Error disconnecting from Redis:', error);
            throw error;
        }
    }

    public getClient(): RedisClientType {
        if (!this.client) {
            throw new Error('Redis client not initialized. Call connect() first.');
        }
        return this.client;
    }

    public async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
        try {
            const client = this.getClient();
            if (expireInSeconds) {
                await client.setEx(key, expireInSeconds, value);
            } else {
                await client.set(key, value);
            }
        } catch (error) {
            console.error('Error setting Redis key:', error);
            throw error;
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            const client = this.getClient();
            return await client.get(key);
        } catch (error) {
            console.error('Error getting Redis key:', error);
            throw error;
        }
    }

    public async delete(key: string): Promise<number> {
        try {
            const client = this.getClient();
            return await client.del(key);
        } catch (error) {
            console.error('Error deleting Redis key:', error);
            throw error;
        }
    }

    public isRedisConnected(): boolean {
        return this.isConnected;
    }

    public async clearAll(): Promise<void> {
        try {
            const client = this.getClient();
            await client.flushAll();
            console.log('Redis cache cleared');
        } catch (error) {
            console.error('Error clearing Redis cache:', error);
            throw error;
        }
    }
}

export const redis = RedisConfig.getInstance();

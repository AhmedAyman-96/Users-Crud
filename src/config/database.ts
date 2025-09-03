import mongoose from 'mongoose';

export class DatabaseConfig {
    private static instance: DatabaseConfig;
    private isConnected: boolean = false;

    private constructor() { }

    public static getInstance(): DatabaseConfig {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new DatabaseConfig();
        }
        return DatabaseConfig.instance;
    }

    public async connect(uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb'): Promise<void> {
        try {
            if (this.isConnected) {
                console.log('Database already connected');
                return;
            }

            const options = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };

            await mongoose.connect(uri, options);

            this.isConnected = true;
            console.log('Successfully connected to MongoDB');

            mongoose.connection.on('error', (error) => {
                console.error('MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
                this.isConnected = true;
            });

        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.connection.close();
            this.isConnected = false;
            console.log('Successfully disconnected from MongoDB');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public getDatabaseName(): string {
        return mongoose.connection.name || 'unknown';
    }
}

export const database = DatabaseConfig.getInstance();

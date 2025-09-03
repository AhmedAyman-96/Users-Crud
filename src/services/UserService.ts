import { User, IUser } from '../models/User';
import { redis } from '../config/redis';
import { config } from '../config/environment';

export class UserService {
    private static instance: UserService;
    private readonly CACHE_PREFIX = 'users:';
    private readonly CACHE_ALL_USERS_KEY = 'users:all';

    private constructor() { }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    public async createUser(userData: { name: string; email: string; age: number }): Promise<IUser> {
        try {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const user = new User(userData);
            const savedUser = await user.save();

            await this.invalidateUsersCache();

            return savedUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    public async getAllUsers(): Promise<IUser[]> {
        try {
            const cachedUsers = await this.getCachedUsers();
            if (cachedUsers) {
                console.log('Returning users from cache');
                return cachedUsers;
            }

            const users = await User.find().sort({ createdAt: -1 });

            await this.cacheUsers(users);

            console.log('Returning users from database');
            return users;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    public async getUserById(id: string): Promise<IUser | null> {
        try {
            const cachedUser = await this.getCachedUser(id);
            if (cachedUser) {
                console.log(`Returning user ${id} from cache`);
                return cachedUser;
            }

            const user = await User.findById(id);
            if (user) {
                await this.cacheUser(user);
            }

            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    public async updateUserById(
        id: string,
        updateData: Partial<{ name: string; email: string; age: number }>
    ): Promise<IUser | null> {
        try {
            if (updateData.email) {
                const existingUser = await User.findOne({
                    email: updateData.email,
                    _id: { $ne: id }
                });
                if (existingUser) {
                    throw new Error('User with this email already exists');
                }
            }

            const user = await User.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (user) {
                await this.cacheUser(user);
                await this.invalidateUsersCache();
            }

            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    public async deleteUserById(id: string): Promise<boolean> {
        try {
            const result = await User.findByIdAndDelete(id);

            if (result) {
                await this.deleteCachedUser(id);
                await this.invalidateUsersCache();
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    private async getCachedUsers(): Promise<IUser[] | null> {
        try {
            const cachedData = await redis.get(this.CACHE_ALL_USERS_KEY);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            return null;
        } catch (error) {
            console.error('Error getting cached users:', error);
            return null;
        }
    }

    private async getCachedUser(id: string): Promise<IUser | null> {
        try {
            const cachedData = await redis.get(`${this.CACHE_PREFIX}${id}`);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            return null;
        } catch (error) {
            console.error('Error getting cached user:', error);
            return null;
        }
    }

    private async cacheUsers(users: IUser[]): Promise<void> {
        try {
            await redis.set(
                this.CACHE_ALL_USERS_KEY,
                JSON.stringify(users),
                config.CACHE_TTL_SECONDS
            );
        } catch (error) {
            console.error('Error caching users:', error);
        }
    }

    private async cacheUser(user: IUser): Promise<void> {
        try {
            await redis.set(
                `${this.CACHE_PREFIX}${user._id}`,
                JSON.stringify(user),
                config.CACHE_TTL_SECONDS
            );
        } catch (error) {
            console.error('Error caching user:', error);
        }
    }

    private async deleteCachedUser(id: string): Promise<void> {
        try {
            await redis.delete(`${this.CACHE_PREFIX}${id}`);
        } catch (error) {
            console.error('Error deleting cached user:', error);
        }
    }

    private async invalidateUsersCache(): Promise<void> {
        try {
            await redis.delete(this.CACHE_ALL_USERS_KEY);
            console.log('Users cache invalidated');
        } catch (error) {
            console.error('Error invalidating users cache:', error);
        }
    }


}

export const userService = UserService.getInstance();

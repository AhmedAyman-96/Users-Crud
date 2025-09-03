import { UserService } from '../src/services/UserService';
import { redis } from '../src/config/redis';

describe('UserService - Core Functionality', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = UserService.getInstance();
        jest.clearAllMocks();
    });

    describe('CRUD Operations', () => {
        it('should create a new user successfully', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30
            };

            const user = await userService.createUser(userData);

            expect(user).toBeDefined();
            expect(user.name).toBe(userData.name);
            expect(user.email).toBe(userData.email);
            expect(user.age).toBe(userData.age);
            expect(user._id).toBeDefined();
        });

        it('should get all users', async () => {
            // Create test user
            await userService.createUser({
                name: 'John Doe',
                email: 'john@example.com',
                age: 30
            });

            const users = await userService.getAllUsers();

            expect(Array.isArray(users)).toBe(true);
            expect(users.length).toBeGreaterThan(0);
            expect(users[0]).toHaveProperty('name');
            expect(users[0]).toHaveProperty('email');
            expect(users[0]).toHaveProperty('age');
        });

        it('should get user by ID', async () => {
            // Create test user
            const createdUser = await userService.createUser({
                name: 'Jane Doe',
                email: 'jane@example.com',
                age: 25
            });

            const user = await userService.getUserById(createdUser._id.toString());

            expect(user).toBeDefined();
            expect(user!.name).toBe('Jane Doe');
            expect(user!.email).toBe('jane@example.com');
        });

        it('should update user successfully', async () => {
            // Create test user
            const createdUser = await userService.createUser({
                name: 'Bob Smith',
                email: 'bob@example.com',
                age: 28
            });

            // Update user
            const updatedUser = await userService.updateUserById(
                createdUser._id.toString(),
                { age: 29, name: 'Bob Updated' }
            );

            expect(updatedUser).toBeDefined();
            expect(updatedUser!.age).toBe(29);
            expect(updatedUser!.name).toBe('Bob Updated');
        });

        it('should delete user successfully', async () => {
            // Create test user
            const createdUser = await userService.createUser({
                name: 'Delete Me',
                email: 'delete@example.com',
                age: 20
            });

            // Delete user
            const deleted = await userService.deleteUserById(createdUser._id.toString());
            expect(deleted).toBe(true);

            // Verify user is deleted
            const user = await userService.getUserById(createdUser._id.toString());
            expect(user).toBeNull();
        });
    });

    describe('Error Handling', () => {
        it('should throw error for duplicate email', async () => {
            // Create first user
            await userService.createUser({
                name: 'User One',
                email: 'duplicate@example.com',
                age: 30
            });

            // Try to create user with same email
            await expect(userService.createUser({
                name: 'User Two',
                email: 'duplicate@example.com',
                age: 25
            })).rejects.toThrow('User with this email already exists');
        });

        it('should return null for non-existent user', async () => {
            const user = await userService.getUserById('507f1f77bcf86cd799439011');
            expect(user).toBeNull();
        });

        it('should return false when deleting non-existent user', async () => {
            const deleted = await userService.deleteUserById('507f1f77bcf86cd799439011');
            expect(deleted).toBe(false);
        });
    });

    describe('Caching', () => {
        it('should return users from cache when available', async () => {
            const mockUsers = [{
                _id: 'cached-user-1',
                name: 'Cached User',
                email: 'cached@example.com',
                age: 30
            }];

            // Mock Redis cache hit
            const mockGet = redis.get as jest.MockedFunction<typeof redis.get>;
            mockGet.mockResolvedValue(JSON.stringify(mockUsers));

            const users = await userService.getAllUsers();

            expect(users).toEqual(mockUsers);
            expect(mockGet).toHaveBeenCalledWith('users:all');
        });

        it('should cache users after database fetch', async () => {
            // Create user in database
            await userService.createUser({
                name: 'Cache Test',
                email: 'cache@example.com',
                age: 35
            });

            // Mock cache miss and set
            const mockGet = redis.get as jest.MockedFunction<typeof redis.get>;
            const mockSet = redis.set as jest.MockedFunction<typeof redis.set>;

            mockGet.mockResolvedValue(null);
            mockSet.mockResolvedValue(undefined);

            const users = await userService.getAllUsers();

            expect(users.length).toBeGreaterThan(0);
            expect(mockGet).toHaveBeenCalledWith('users:all');
            expect(mockSet).toHaveBeenCalled();
        });
    });

    describe('Cache Invalidation', () => {
        it('should invalidate cache after create/update/delete operations', async () => {
            const mockDelete = redis.delete as jest.MockedFunction<typeof redis.delete>;
            mockDelete.mockResolvedValue(1);

            // Create user
            const user = await userService.createUser({
                name: 'Cache Invalidation Test',
                email: 'cache-invalidation@example.com',
                age: 40
            });

            expect(mockDelete).toHaveBeenCalledWith('users:all');

            // Reset mock
            jest.clearAllMocks();
            mockDelete.mockResolvedValue(1);

            // Update user
            await userService.updateUserById(user._id.toString(), { age: 41 });
            expect(mockDelete).toHaveBeenCalledWith('users:all');

            // Reset mock
            jest.clearAllMocks();
            mockDelete.mockResolvedValue(1);

            // Delete user
            await userService.deleteUserById(user._id.toString());
            expect(mockDelete).toHaveBeenCalledWith('users:all');
        });
    });
});

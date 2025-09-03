import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService';
import { IUser } from '../models/User';

export class UserController {
    private static instance: UserController;

    private constructor() { }

    public static getInstance(): UserController {
        if (!UserController.instance) {
            UserController.instance = new UserController();
        }
        return UserController.instance;
    }

    public async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData = req.body;
            const user = await userService.createUser(userData);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    user: this.formatUserResponse(user)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await userService.getAllUsers();

            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    users: users.map(user => this.formatUserResponse(user)),
                    count: users.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: {
                    user: this.formatUserResponse(user)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public async updateUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const user = await userService.updateUserById(id, updateData);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: {
                    user: this.formatUserResponse(user)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public async deleteUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await userService.deleteUserById(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }



    private formatUserResponse(user: IUser): any {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            age: user.age,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}

export const userController = UserController.getInstance();

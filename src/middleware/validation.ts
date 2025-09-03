import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export class ValidationError extends Error {
    public readonly statusCode: number;
    public readonly errors: string[];

    constructor(message: string, errors: string[] = []) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.errors = errors;
    }
}

const createUserSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Name cannot be empty',
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email cannot be empty',
            'any.required': 'Email is required'
        }),

    age: Joi.number()
        .integer()
        .min(1)
        .max(120)
        .required()
        .messages({
            'number.base': 'Age must be a number',
            'number.min': 'Age must be at least 1',
            'number.max': 'Age cannot exceed 120',
            'any.required': 'Age is required'
        })
});

const updateUserSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .messages({
            'string.empty': 'Name cannot be empty',
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 50 characters'
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email cannot be empty'
        }),

    age: Joi.number()
        .integer()
        .min(1)
        .max(120)
        .messages({
            'number.base': 'Age must be a number',
            'number.min': 'Age must be at least 1',
            'number.max': 'Age cannot exceed 120'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

export const validateRequest = (
    schema: Joi.ObjectSchema,
    property: 'body' | 'params' | 'query' = 'body'
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            const validationError = new ValidationError(
                'Validation failed',
                errorMessages
            );
            next(validationError);
            return;
        }

        (req as any)[property] = value;
        next();
    };
};

export const validateCreateUser = validateRequest(createUserSchema, 'body');

export const validateUpdateUser = validateRequest(updateUserSchema, 'body');

export const validateUserId = validateRequest(
    Joi.object({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid user ID format',
                'any.required': 'User ID is required'
            })
    }),
    'params'
);

export const handleValidationError = (
    error: ValidationError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (error instanceof ValidationError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
                details: error.errors
            }
        });
        return;
    }

    next(error);
};

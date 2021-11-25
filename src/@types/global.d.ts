import { NextFunction, Request, Response } from 'express';
import { Schema as ExpressValidatorSchema } from 'express-validator';
import mongoose, { Date, Types } from 'mongoose';

declare global {
    interface IRoute {
        path: string;
        method: Methods;
        validationSchema?: ExpressValidatorSchema;
        // permission?: IRole[];
        middleware: IMiddleware[] | any[];
        handler: IHandler;
    }

    type IMiddleware = (req: Request, res: Response, next: NextFunction) => any;

    type IHandler = (req: Request, res: Response, next: NextFunction) => any;

    type IRole = 'manager' | 'employee';
    interface IUser extends mongoose.Document {
        username: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
        role: IRole;
        // Methods:
        comparePassword: (str: string) => any;
        hasPermission: (pers: IRole[]) => boolean;
    }
    interface ExpressValidatorError {
        msg?: string;
        location?: string;
        param?: string;
        value?: any;
    }
}

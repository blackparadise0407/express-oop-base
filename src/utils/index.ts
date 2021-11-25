import { BCRYPT_SALT_WORKER } from '@app/config';
import AdvancedError from '@app/shared/AdvancedError';
import bcryptjs from 'bcryptjs';
import { Request, Response } from 'express';
import { forEach, includes } from 'lodash';

export const stringHash = async (str: string): Promise<string> => {
    try {
        const salt = await bcryptjs.genSalt(BCRYPT_SALT_WORKER);
        const hashedString = await bcryptjs.hash(str, salt);
        return hashedString;
    } catch (e: any) {
        throw new AdvancedError({
            message: e.message,
            type: 'bcrypt.error',
        });
    }
};

export const catchAsync =
    (fn: any) => (req: Request, res: Response, next: any) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };

export const hasRole = (user: IUser, roles: IRole[]): void => {
    if (!includes(roles, user.role)) {
        const error = new AdvancedError({
            message: 'User does not have permission',
            type: 'not.permission',
        });
        error.setStatusCode(403);
        throw error;
    }
};

export const filterParams = (obj: any, p: string[]) => {
    const cloneObj = { ...obj };
    forEach(p, (s) => {
        delete obj[s];
    });
    return cloneObj;
};

import { TOKEN_CONFIG } from '@app/config';
import AdvancedError from '@app/shared/AdvancedError';
import fs from 'fs';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import path from 'path';

export const tokenGen = (
    { email, _id, role }: IUser,
    type: 'access' | 'refresh' = 'access',
): string => {
    const options: SignOptions = {
        expiresIn: TOKEN_CONFIG.access.expire, // 1 hour
    };
    // const keyPem = fs.readFileSync();
    const rootDir = path.dirname(__dirname);
    const keyPem = fs.readFileSync(path.join(rootDir, '/.ssh/jwtRS256.key'));
    if (type === 'refresh') {
        options.algorithm = 'RS256';
        options.expiresIn = TOKEN_CONFIG.refresh.expire; // 8 hours
    }
    return jwt.sign(
        { _id, email, role },
        `${type === 'refresh' ? keyPem : process.env.JWT_KEY}`,
        options,
    );
};

export const validateToken = (
    token: string,
    type: 'refresh' | 'access' = 'access',
) => {
    try {
        const rootDir = path.dirname(__dirname);
        const keyPem = fs.readFileSync(
            path.join(rootDir, '/.ssh/jwtRS256.key'),
        );
        const opt: VerifyOptions = {};
        if (type === 'refresh') {
            opt.algorithms = ['RS256'];
        }
        const decoded = jwt.verify(
            token,
            type === 'refresh' ? keyPem : `${process.env.JWT_KEY}`,
            opt,
        );
        return decoded;
    } catch (e: any) {
        const err = new AdvancedError({
            message: e.message,
            type: 'jwt.error',
        });
        if (e.message === 'jwt expired') err.setStatusCode(401);
        throw err;
    }
};

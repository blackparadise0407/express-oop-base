import moduleAlias from 'module-alias';
moduleAlias.addAlias('@app', __dirname);
// tslint:disable-next-line: ordered-imports
import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env' });
} else dotenv.config({ path: '.prod.env' });

import App from '@app/modules/app/App';
import AuthController from '@app/modules/auth/AuthController';
import AbstractController from '@app/shared/AbstractController';
import UserController from './modules/user/UserController';

const app: Application = express();
const PORT = process.env.PORT || 5050;
const server = new App(app, PORT);

const controllers: Array<AbstractController> = [
    new AuthController(),
    new UserController(),
];

// Middlewares
const globalMiddlewares: any = [
    morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'),
    helmet(),
    cors({
        origin: process.env.CORS_ORIGIN,
        optionsSuccessStatus: 200,
    }),
    express.urlencoded({ extended: false }),
    express.json(),
];

Promise.resolve()
    .then(() => {
        return server.initDatabase();
    })
    .then((initSuccess: any) => {
        if (initSuccess) {
            server.loadGlobalMiddleware(globalMiddlewares);
            server.loadControllers(controllers);
            server.handleError();
            server.run();
        }
    });

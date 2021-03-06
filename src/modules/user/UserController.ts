import User from '@app/modules/user/User';
import { auth } from '@app/services';
import AbstractController from '@app/shared/AbstractController';
import AdvancedError from '@app/shared/AdvancedError';
import AdvancedResponse from '@app/shared/AdvancedResponse';
import { Methods } from '@app/shared/Enum';
import { hasRole } from '@app/utils';
import { Request, Response } from 'express';

class UserController extends AbstractController {
    path = '/user';
    routes: IRoute[] = [
        {
            path: '/',
            method: Methods.GET,
            middleware: [auth],
            handler: this.info,
        },
        {
            path: '/all',
            method: Methods.GET,
            middleware: [auth],
            handler: this.getAll,
        },
        {
            path: '/',
            method: Methods.POST,
            validationSchema: {
                email: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isEmail: {
                        errorMessage: 'is invalid',
                    },
                },
                username: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isString: {
                        errorMessage: 'is invalid',
                    },
                },
                password: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isString: {
                        errorMessage: 'is invalid',
                    },
                },
                role: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isString: {
                        errorMessage: 'is invalid',
                    },
                },
            },
            middleware: [auth],
            handler: this.createAccount,
        },
        {
            path: '/:id',
            method: Methods.DELETE,
            validationSchema: {
                id: {
                    in: 'params',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.deleteUser,
        },
    ];

    protected async info(req: Request, res: Response): Promise<void> {
        let user = req.user as IUser;
        user = (await User.findById(user._id)) as IUser;
        res.send(
            new AdvancedResponse({
                data: user,
            }),
        );
    }

    protected async getAll({ user }: Request, res: Response): Promise<void> {
        hasRole(user, ['manager']);
        const employee = (await User.find().sort({
            created_at: -1,
        })) as IUser[];
        res.send(
            new AdvancedResponse({
                data: employee,
            }),
        );
    }

    protected async createAccount(
        { user, body }: Request,
        res: Response,
    ): Promise<void> {
        hasRole(user, ['manager']);
        const { email, password, username, role } = body;
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            throw new AdvancedError({
                message: 'This email has been registered',
                type: 'invalid',
            });
        }
        const newUser = new User({
            username,
            email,
            password,
            role,
        });
        const savedUser: IUser = await newUser.save();
        res.send(
            new AdvancedResponse({
                data: savedUser,
            }),
        );
    }

    protected async deleteUser(
        { user, params }: Request,
        res: Response,
    ): Promise<void> {
        hasRole(user, ['manager']);
        const { id } = params;
        const existedUser = await User.findById(id);
        if (!existedUser) {
            throw new AdvancedError({
                message: 'User does not exist',
                type: 'not.found',
            });
        }
        if (existedUser._id.toString() === user._id.toString()) {
            throw new AdvancedError({
                message: 'Invalid request',
                type: 'invalid',
            });
        }
        await User.deleteOne({ _id: id });
        res.send(
            new AdvancedResponse({
                data: {},
                message: 'Delete user successfully',
            }),
        );
    }
}

export default UserController;

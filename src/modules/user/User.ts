import AdvancedError from '@app/shared/AdvancedError';
import { UserRoleEnum } from '@app/shared/Enum';
import { stringHash } from '@app/utils';
import bcryptjs from 'bcryptjs';
import { includes } from 'lodash';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        google_id: {
            type: String,
        },
        role: {
            type: String,
            enum: [...UserRoleEnum],
            default: 'employee',
        },
    },
    {
        versionKey: false,
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

// tslint:disable-next-line: only-arrow-functions
userSchema.pre('save', async function (next) {
    const user: any = this;
    if (!user.isModified('password')) return next();

    try {
        user.password = await stringHash(user.password);
        next();
    } catch (e: any) {
        next(e);
    }
});

userSchema.methods.comparePassword = async function (
    comparedString: string,
): Promise<boolean> {
    const user = this as IUser;
    try {
        return await bcryptjs.compare(comparedString, user.password);
    } catch (e: any) {
        throw new AdvancedError({
            message: e.message,
            type: 'bcrypt.error',
        });
    }
};

userSchema.methods.hasPermission = function (pers: IRole[]) {
    const user = this as IUser;
    let hasPer = true;
    if (!user.role) hasPer = false;
    if (!includes(pers, user.role)) hasPer = false;
    return hasPer;
};

userSchema.set('toJSON', {
    transform: (_user: IUser, ret: { [key: string]: any }) => {
        delete ret.password;
        for (const v in ret) {
            if (!ret[v]) delete ret[v];
        }
    },
});

export default mongoose.model<IUser>('User', userSchema);

import { Model, Types } from "mongoose";
import { USER_ROLES, USER_STATUS } from "../../../enum/user";
export { USER_ROLES, USER_STATUS };

type IAuthentication = {
    restrictionLeftAt: Date | null
    resetPassword: boolean
    wrongLoginAttempts: number
    passwordChangedAt?: Date
    oneTimeCode: string
    latestRequestAt: Date
    expiresAt?: Date
    requestCount?: number
    authType?: 'createAccount' | 'resetPassword' | 'verifyPhone'
    tempPhone?: string
}

export type IUser = {
    _id: Types.ObjectId;
    email: string;
    image?: string;
    password: string;
    status: USER_STATUS;
    verified: boolean;
    role: USER_ROLES;
    authentication: IAuthentication;
    fcmToken?: string;
    fullName: string;
    phone?: string;
    business?: {
        businessName: string;
        category: Types.ObjectId;
        description?: string;
        yearsInBusiness?: number;
        employeesCount?: number;
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        website?: string;
        logo?: string;
        photos: string[];
        facebook?: string;
        instagram?: string;
        twitter?: string;
    };
};

export type UserModel = {
    isPasswordMatched: (givenPassword: string, savedPassword: string) => Promise<boolean>;
} & Model<IUser>;

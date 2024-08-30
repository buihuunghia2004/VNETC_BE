import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { env } from '~/config/environment';
import ApiErr from '~/utils/ApiError';
import bcryptjs from 'bcryptjs';

const { Schema } = mongoose;

const accountSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    fullName: {
        type: String,
        unique: true,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String,
        default: null
    },
    _destroy: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

export const Account = mongoose.model('Account', accountSchema);

const isAdmin = (email) => {
    if (email !== env.ADMIN_EMAIL) {
        throw new Error('Not an admin');
    }
};

const addAccount = async (data) => {
    const { email, password } = data;
    const accountExist = await Account.exists({ email });

    if (accountExist) {
        throw new ApiErr(StatusCodes.CONFLICT, 'Email already exists');
    }

    const salt = bcryptjs.genSaltSync(10);
    data.password = bcryptjs.hashSync(password, salt);

    const newAccount = new Account(data);
    await newAccount.save();
    return newAccount;
};

const changePassword = async (data) => {
    const { accountId, hashPassword } = data;

    const account = await Account.findById(accountId);
    if (!account) {
        throw new Error('Account not found');
    }

    account.password = hashPassword;
    await account.save();

    return account;
};

const updateAccount = async (data) => {
    const { accountId, username, fullName } = data;

    // Tìm tài khoản và kiểm tra sự tồn tại của nó
    const account = await Account.findById(accountId);
    if (!account) {
        throw new Error('Account not found');
    }

    // Kiểm tra sự tồn tại của fullName khác với tài khoản hiện tại
    const existingAccountWithFullName = await Account.findOne({ fullName, _id: { $ne: accountId } });
    if (existingAccountWithFullName) {
        return {
            status: false,
            statusCode: 400,
            message: 'Full name already exists'
        };
    }

    // Cập nhật thông tin tài khoản
    Object.assign(account, { username, fullName });

    await account.save();

    return {
        _id: account._id,
        username: account.username,
        fullName: account.fullName,
        updatedAt: account.updatedAt
    }
};


const deleteAccount = async (id) => {
    const deleted = await Account.findByIdAndDelete(id);
    if (!deleted) {
        throw new Error('Delete failed');
    }
    return true;
};

const getAllAccount = async () => {
    return Account.find({_destroy: {$ne: true}}, {password: 0, _destroy: 0});
};

export const accountModel = {
    addAccount,
    isAdmin,
    changePassword,
    getAllAccount,
    updateAccount,
    deleteAccount
};

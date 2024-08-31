import {StatusCodes} from 'http-status-codes'
import mongoose from 'mongoose'
import {env} from '~/config/environment'
import ApiErr from '~/utils/ApiError'

const {Schema} = mongoose
import bcryptjs from 'bcryptjs'

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
}, {timestamps: true})

export const Account = mongoose.model('Account', accountSchema)

const isAdmin = (email) => {
    if (email != env.ADMIN_EMAIL) {
        throw new Error('not is admin')
    }
}
const addAccount = async (data) => {
    const {email} = data
    const accountExist = await Account.exists({email: email})

    if (accountExist) {
        throw new ApiErr(StatusCodes.CONFLICT, 'Email is exist')
    }

    const salt = bcryptjs.genSaltSync(10)
    const hash = bcryptjs.hashSync(password, salt)
    data.password = hash

    const newAccount = new Account(data)
    await newAccount.save()
    return newAccount
}
const changePassword = async (data) => {
    const {accountId, hashPassword} = data
    const changed = await Account.findByIdAndUpdate(accountId, {password: hashPassword})
    if (!changed) {
        throw new Error('Update fail')
    }
    return changed
}
const updateAccount = async (data) => {
    const {accountId, username, fullName} = data

    const account = await Account.findByIdAndUpdate(accountId, {username: 1, fullName: 1})
    account.username = username
    account.fullName = fullName
    await account.save()
    return account
}
const deleteAccount = async (id) => {
    const deleted = await Account.findByIdAndDelete(id)
    if (!deleted) {
        throw new Error('Delete fail')
    }
    return true
}
const getAllAccount = async () => {
    const accounts = await Account.find({_destroy: {$ne: true}}, {password: 0, _destroy: 0})
    return accounts
}


export const accountModel = {
    addAccount,
    isAdmin,
    changePassword,
    getAllAccount,
    updateAccount,
    deleteAccount
}
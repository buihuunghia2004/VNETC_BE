import {accountModel} from "~/models/accountModel"

const {StatusCodes} = require("http-status-codes")
const {SuccessRes} = require("~/utils/SuccessRes")
const {accountService} = require("./accountService")

const getAllAccount = async (req, res, next) => {
    try {
        const {email} = req.query;
        let accounts;

        if (email) {
            accounts = await accountService.getAccountByEmail(email);
        } else {
            accounts = await accountModel.getAllAccount();
        }

        SuccessRes(res, accounts, 'Get account successful');
    } catch (error) {
        next(error);
    }
}


const create = async (req, res, next) => {
    try {
        const created = await accountService.create(req.body, req.account.username)
        SuccessRes(res, created, 'Add account successful')
    } catch (error) {
        next(error)
    }
}

const deleteAccount = async (req, res, next) => {
    try {
        const deleted = await accountService.deleteAccount(req.body)
        SuccessRes(res, deleted, 'Delete successful')
    } catch (error) {
        next(error)
    }
}

const changePassword = async (req, res, next) => {
    try {
        const {id} = req.params
        const changed = await accountService.changePassword(id,req.body)
        SuccessRes(res, changed, 'Change password successful')
    } catch (error) {
        next(error)
    }
}

const updateAccount = async (req, res, next) => {
    try {
        const updated = await accountModel.updateAccount(req.body)
        delete updated.password
        SuccessRes(res, updated, 'Update successful')
    } catch (error) {
        next(error)
    }
}
const getAccountById = async (req, res, next) => {
    try {
        const {id} = req.params
        const result = await accountService.getAccountById(id)
        SuccessRes(res, result, 'Get Account successful')
    } catch (e) {
        next(e)
    }
}

export const accountController = {
    create,
    deleteAccount,
    changePassword,
    updateAccount,
    getAllAccount,
    getAccountById,
}
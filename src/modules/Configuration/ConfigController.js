import {config} from "dotenv"
import configService from "./ConfigService"
import {SuccessRes} from "~/utils/SuccessRes"
import ApiErr from "~/utils/ApiError"
import {location} from "express/lib/response"

config()

export const addConfigController = async (req, res, next) => {
    try {
        const data = req.body
        const file = req.files
        const created = await configService.addConfig(
            data,
            file,
            req.account.username
        )
        if (!created) {
            throw new ApiErr(444, "Create fail")
        }
        SuccessRes(res, created, "Create new config success")
    } catch (error) {
        next(error)
    }
}
export const getConfigById = async (req, res, next) => {
    try {
        const id = await req.params.id
        const Config = await configService.getConfig(id)
        SuccessRes(res, Config, "Get Config success")
    } catch (error) {
        next(error)
    }
}
export const deleteConfig = async (req, res, next) => {
    try {
        const id = await req.params.id
        const Config = await configService.deleteConfig(id)
        SuccessRes(res, Config, "Delete Config success")
    } catch (error) {
        next(error)
    }
}
export const getAllConfig = async (req, res, next) => {
    try {
        const Config = await configService.getAll(req.query)
        SuccessRes(res, Config, "Get all Config success")
    } catch (error) {
        next(error)
    }
}

export const updateConfig = async (req, res, next) => {
    try {
        const {body: data, params: {id}} = req
        const result = await configService.updateConfig(id,data)
        SuccessRes(res, result, "Updated Config Successfully")
    } catch (e) {
        next(e)
    }
}

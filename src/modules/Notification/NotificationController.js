import {SuccessRes} from "~/utils/SuccessRes";
import notificationService from "~/modules/Notification/NotificationService";

export const addNotification = async (req, res, next) => {
    try {
        const {body: data} = req
        const result = await notificationService.addNotification(data)
        SuccessRes(res, result, "add Notification Success")
    } catch (e) {
        next(e)
    }
}

export const getNotification = async (req, res, next) => {
    try {
        const {query: {id}} = req
        const result = await notificationService.getNotication(id)
        SuccessRes(res, result, "get Notification Success")
    } catch (e) {
        next(e)
    }
}
export const getNotiById = async (req, res, next) => {
    try {
        const {params: {id}} = req
        const result = await notificationService.getById(id)
        SuccessRes(res, result, "get Notification By Id Success")
    } catch (e) {
        next(e)
    }
}
export const deleteNotiById = async (req, res, next) => {
    try {
        const {params: {id}} = req
        const result = await notificationService.deleteById(id)
        SuccessRes(res, result, "Delete Notification By Id Success")
    } catch (e) {
        next(e)
    }
}
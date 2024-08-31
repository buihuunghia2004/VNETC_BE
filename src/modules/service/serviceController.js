import ApiErr from "~/utils/ApiError";
import {SuccessRes} from "~/utils/SuccessRes";
import Service from "~/modules/service/serService";
import {newsService} from "~/modules/news/newsService";

export const addService = async (req, res, next) => {
    try {
        const {body: data, file} = await req
        const result = await Service.addService(data, file)
        SuccessRes(res, result, "Create new Service success")
    } catch (error) {
        next(error)
    }
}
export const getService = async (req, res, next) => {
    try {
        const data = req.query
        const result = await Service.getService(data)
        SuccessRes(res, result, "Get Service success")
    } catch (error) {
        next(error)
    }
}
export const getServiceById = async (req, res, next) => {
    try {
        const id = req.params.id
        const result = await Service.getServiceById(id);
        SuccessRes(res, result, "Get Service by id success")
    } catch (e) {
        next(e)
    }
}
export const updateService = async (req, res, next) => {
    try {
        const id = req.params.id
        const data = req.body
        const file = req.file
        const result = await Service.updateService(id, data, file)
        SuccessRes(res, result, "Update Service success")
    } catch (e) {
        next(e)
    }
}
export const deleteService = async (req, res, next) => {
    try {
        const id = req.params.id
        const result = await Service.deleteService(id)
        SuccessRes(res, result, "Delete Service success")
    } catch (e) {
        next(e)
    }
}
export const getByTopViews = async (req, res, next) => {
    try {
        const result = await Service.getByTopViews()
        SuccessRes(res, result, "Get by Top Views Success")
    } catch (e) {
        next(e)
    }
}
export const getByFeatured = async (req, res, next) => {
    try {
        const result = await Service.getFeatured()
        SuccessRes(res, result, 'Get Featured Successs')
    } catch (e) {
        next(e)
    }
}
export const search = async (req, res, next) => {
    try {
        const {data, page, limit} = req.query
        const result = await Service.search(data, page, limit)
        SuccessRes(res, result, 'search Successs')
    } catch (e) {
        next(e)
    }
}

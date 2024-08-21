import {newsService} from "./newsService"

const {newsModel} = require("~/models/newsModel")
const {SuccessRes} = require("~/utils/SuccessRes")

const addNews = async (req, res, next) => {
    try {
        const {body: data, file: image, account} = req
        const added = await newsService.createNews(data, image, account)

        SuccessRes(res, added, 'Add news succesfull')
    } catch (error) {
        next(error)
    }
}
const addNewsDetail = async (req, res, next) => {
    try {
        const added = await newsService.createNewsDetail(req.body, req.account)
        SuccessRes(res, added, 'Add news detail successful')
    } catch (error) {
        next(error)
    }
}

const getNews = async (req, res, next) => {
    try {
        const getNews = await newsService.findAllNews(req.query)
        SuccessRes(res, getNews, 'get news successful')
    } catch (error) {
        next(error)
    }
}
const getNewsbyid = async (req, res, next) => {
    try {
        const getNews = await newsService.getNewsByNId(req.params.id)
        SuccessRes(res, getNews, 'get news successful')
    } catch (error) {
        next(error)
    }
}
const deleteNews = async (req, res, next) => {
    try {
        const deleteNews = await newsService.deleteNews(req.params.id)
        SuccessRes(res, deleteNews, 'Delete news successful')
    } catch (error) {
        next(error)
    }
}
const updateNews = async (req, res, next) => {
    try {
        const update = await newsService.updateNews(req.params.id, req.body, req.file, req.account)
        SuccessRes(res, update, 'Updated successful')
    } catch (error) {
        next(error)
    }
}
const getTopViews = async (req, res, next) => {
    try {
        const result = await newsService.getTopViews()
        SuccessRes(res, result, 'Get Top Views Successs')
    } catch (e) {
        next(e)
    }
}
const getFeatured = async (req, res, next) => {
    try {
        const result = await newsService.getFeatured()
        SuccessRes(res, result, 'Get Featured Successs')
    } catch (e) {
        next(e)
    }
}
const search = async (req, res, next) => {
    try {
        const {data, page, limit} = req.query
        const result = await newsService.searchNews(data, page, limit)
        SuccessRes(res, result, 'Get Featured Successs')
    } catch (e) {
        next(e)
    }
}
export const newsController = {
    addNews,
    addNewsDetail,
    getNews,
    getNewsbyid,
    deleteNews,
    updateNews,
    getTopViews,
    getFeatured,
    search
}
import {newsService} from "./newsService"
import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";

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
        const { page, limit, categoryId, startDate, endDate } = req.query;

        // Validate date inputs
        if (startDate && !isValidDate(startDate)) {
            return next(new ApiErr(StatusCodes.BAD_REQUEST, "Invalid start date format"));
        }
        if (endDate && !isValidDate(endDate)) {
            return next(new ApiErr(StatusCodes.BAD_REQUEST, "Invalid end date format"));
        }

        const result = await newsService.findAllNews({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            categoryId,
            startDate,
            endDate
        });

        SuccessRes(res, result, 'Get news successful');
    } catch (error) {
        next(error);
    }
};

// Hàm helper để kiểm tra tính hợp lệ của ngày
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};
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
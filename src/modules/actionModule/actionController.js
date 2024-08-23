import {actionService} from "./actionService";
import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";

const {SuccessRes} = require("~/utils/SuccessRes");

const addAction = async (req, res, next) => {
    try {
        const {body: data, file: image, account} = req;
        const added = await actionService.createAction(data, image, account);

        SuccessRes(res, added, 'Add action successful');
    } catch (error) {
        next(error);
    }
};

const addActionDetail = async (req, res, next) => {
    try {
        const added = await actionService.createActionDetail(req.body, req.account);
        SuccessRes(res, added, 'Add action detail successful');
    } catch (error) {
        next(error);
    }
};

const getActions = async (req, res, next) => {
    try {
        const { page, limit, categoryId, startDate, endDate } = req.query;

        if (startDate && !isValidDate(startDate)) {
            return next(new ApiErr(StatusCodes.BAD_REQUEST, "Invalid start date format"));
        }
        if (endDate && !isValidDate(endDate)) {
            return next(new ApiErr(StatusCodes.BAD_REQUEST, "Invalid end date format"));
        }

        const result = await actionService.findAllActions({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            categoryId,
            startDate,
            endDate
        });

        SuccessRes(res, result, 'Get actions successful');
    } catch (error) {
        next(error);
    }
};

const getActionById = async (req, res, next) => {
    try {
        const action = await actionService.getActionById(req.params.id);
        SuccessRes(res, action, 'Get action successful');
    } catch (error) {
        next(error);
    }
};

const deleteAction = async (req, res, next) => {
    try {
        const deleted = await actionService.deleteAction(req.params.id);
        SuccessRes(res, deleted, 'Delete action successful');
    } catch (error) {
        next(error);
    }
};

const updateAction = async (req, res, next) => {
    try {
        const updated = await actionService.updateAction(req.params.id, req.body, req.file, req.account);
        SuccessRes(res, updated, 'Update action successful');
    } catch (error) {
        next(error);
    }
};

const getTopViews = async (req, res, next) => {
    try {
        const result = await actionService.getTopViews();
        SuccessRes(res, result, 'Get Top Views Success');
    } catch (error) {
        next(error);
    }
};

const getFeatured = async (req, res, next) => {
    try {
        const result = await actionService.getFeatured();
        SuccessRes(res, result, 'Get Featured Success');
    } catch (error) {
        next(error);
    }
};

const search = async (req, res, next) => {
    try {
        const {data, page, limit} = req.query;
        const result = await actionService.searchActions(data, page, limit);
        SuccessRes(res, result, 'Search action successful');
    } catch (error) {
        next(error);
    }
};

const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

export const actionController = {
    addAction,
    addActionDetail,
    getActions,
    getActionById,
    deleteAction,
    updateAction,
    getTopViews,
    getFeatured,
    search
};

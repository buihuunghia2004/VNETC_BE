import uploadSingleImageToCloudinary from "~/utils/uploadSingleImage";
import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";
import {io} from "~/server";

const {Category} = require("~/models/categoryModel");
const {Actions, ActionDetail} = require("~/models/actionModel");

const findAllActions = async (data) => {
    const {page = 1, limit = 10, categoryId, startDate, endDate} = data;

    let query = {};

    if (categoryId) {
        query.categoryId = categoryId;
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }

    const skip = (page - 1) * limit;

    const [actions, totalCount] = await Promise.all([
        Actions.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({createdAt: -1}),
        Actions.countDocuments(query)
    ]);

    return {
        actions,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
    };
};

const createAction = async ({title, summary, views, categoryId, content, isFeatured}, image, account) => {
    try {
        const uploadImage = await uploadSingleImageToCloudinary(image.path);
        if (!uploadImage) throw new ApiErr(StatusCodes.BAD_REQUEST, "Upload Image fail");
        const images = uploadImage.secure_url;

        const [cateIdExist, findAction] = await Promise.all([
            Category.exists({_id: categoryId}),
            Actions.exists({title}),
        ]);

        if (findAction) throw new ApiErr(StatusCodes.BAD_REQUEST, "Action with this title already exists");
        if (!cateIdExist) throw new ApiErr(StatusCodes.BAD_REQUEST, "Category ID does not exist");

        const action = new Actions({
            title, summary, views, images, categoryId, isFeatured, createdBy: account.username
        });
        const actionDetail = new ActionDetail({
            content, actionId: action._id, createdBy: account.username
        });

        await action.save();
        await actionDetail.save();

        // Emit socket event to client when a new action is added
        io.emit('actionAdded', action);

        return action;
    } catch (error) {
        throw error;
    }
};

const createActionDetail = async (data, account) => {
    const {content, actionId} = data;

    const actionIdExists = await Actions.exists({_id: actionId});
    if (!actionIdExists) {
        throw new Error('ActionId does not exist');
    }

    const actionDetail = new ActionDetail({content, actionId, createdBy: account.username});
    await actionDetail.save();

    return actionDetail;
};

const getActionById = async (actionId) => {
    try {
        const [action, actionDetail] = await Promise.all([
            Actions.findByIdAndUpdate(actionId, {$inc: {views: 1}}, {new: true, lean: true}),
            ActionDetail.findOne({actionId}).lean()
        ]);

        if (!action) {
            throw new Error(`Action not found with id: ${actionId}`);
        }
        if (!actionDetail) {
            throw new Error(`ActionDetail not found with actionId: ${actionId}`);
        }

        action.content = actionDetail.content;
        return action;
    } catch (e) {
        throw new Error('Error retrieving action: ' + e.message);
    }
};

const updateAction = async (id, data, file, account) => {
    try {
        const {content} = data;

        const uploadImage = file ? await uploadSingleImageToCloudinary(file.path) : null;
        const images = uploadImage ? uploadImage.secure_url : null;

        const [updatedAction, updatedActionDetail] = await Promise.all([
            Actions.findByIdAndUpdate({_id: id}, {
                $set: {
                    ...data,
                    images,
                    updatedBy: account.username
                }
            }, {new: true}),
            ActionDetail.findOneAndUpdate({actionId: id}, {
                $set: {
                    content,
                    updatedBy: account.username
                }
            }, {new: true}),
        ]);

        if (!updatedAction) {
            throw new Error('Action not found');
        }

        if (!updatedActionDetail) {
            throw new Error('ActionDetail not found');
        }

        return {updatedAction, updatedActionDetail};
    } catch (err) {
        throw new Error(`Error updating action: ${err.message}`);
    }
};

const deleteAction = async (id) => {
    const action = await Actions.findById(id);
    if (!action) {
        throw new Error('Action not found');
    }

    await ActionDetail.deleteOne({actionId: action._id});
    await action.deleteOne();
    return true;
};

const getTopViews = async () => {
    try {
        const actions = await Actions.find()
            .limit(8)
            .sort({views: -1});
        return actions;
    } catch (e) {
        throw e;
    }
};

const getFeatured = async () => {
    try {
        const featured = await Actions.find({isFeatured: true}).limit(5).sort({createdAt: -1});
        return featured;
    } catch (e) {
        throw e;
    }
};

const searchActions = async (searchTerm, page, limit, startDate, endDate) => {
    try {
        const skip = (page - 1) * limit;
        let searchQuery = {
            $or: [
                {title: {$regex: searchTerm, $options: 'i'}},
                {summary: {$regex: searchTerm, $options: 'i'}}
            ]
        };

        if (startDate && endDate) {
            searchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            searchQuery.createdAt = {$gte: new Date(startDate)};
        } else if (endDate) {
            searchQuery.createdAt = {$lte: new Date(endDate)};
        }

        const [actions, totalCount] = await Promise.all([
            Actions.find(searchQuery)
                .skip(skip)
                .limit(limit)
                .sort({createdAt: -1})
                .lean(),
            Actions.countDocuments(searchQuery)
        ]);

        const actionIds = actions.map(item => item._id);
        const actionDetails = await ActionDetail.find({actionId: {$in: actionIds}}).lean();

        const fullActionResults = actions.map(actionItem => ({
            ...actionItem,
            content: actionDetails.find(detail => detail.actionId.toString() === actionItem._id.toString())?.content || null
        }));

        return {
            results: fullActionResults,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("Error searching actions:", error);
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, "Error searching actions");
    }
};

export const actionService = {
    createAction,
    createActionDetail,
    findAllActions,
    deleteAction,
    updateAction,
    getActionById,
    getTopViews,
    getFeatured,
    searchActions
};

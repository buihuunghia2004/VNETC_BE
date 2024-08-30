import uploadSingleImageToCloudinary from "~/utils/uploadSingleImage";
import ApiErr from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { io } from "~/server";
import { Category } from "~/models/categoryModel";
import { Actions, ActionDetail } from "~/models/actionModel";

const findAllActions = async (data) => {
    const { page = 1, limit = 10, categoryId, startDate, endDate } = data;

    let query = {};
    if (categoryId) query.categoryId = categoryId;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [actions, totalCount] = await Promise.all([
        Actions.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
        Actions.countDocuments(query)
    ]);

    return {
        actions,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
    };
};

const createAction = async ({ title, summary, views, categoryId, content, isFeatured }, image, account) => {
    try {
        const uploadImage = image ? await uploadSingleImageToCloudinary(image.path) : null;
        if (image && !uploadImage) throw new ApiErr(StatusCodes.BAD_REQUEST, "Upload Image failed");

        const images = uploadImage ? uploadImage.secure_url : null;
        const [cateExists, actionExists] = await Promise.all([
            Category.exists({ _id: categoryId }),
            Actions.exists({ title })
        ]);

        if (actionExists) throw new ApiErr(StatusCodes.BAD_REQUEST, "Action with this title already exists");
        if (!cateExists) throw new ApiErr(StatusCodes.BAD_REQUEST, "Category ID does not exist");

        const action = new Actions({ title, summary, views, images, categoryId, isFeatured, createdBy: account.username });
        const actionDetail = new ActionDetail({ content, actionId: action._id, createdBy: account.username });

        await Promise.all([action.save(), actionDetail.save()]);
        io.emit('actionAdded', action);

        return action;
    } catch (error) {
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, `Error creating action: ${error.message}`);
    }
};

const createActionDetail = async (data, account) => {
    const { content, actionId } = data;

    const actionExists = await Actions.exists({ _id: actionId });
    if (!actionExists) throw new ApiErr(StatusCodes.BAD_REQUEST, "ActionId does not exist");

    const actionDetail = new ActionDetail({ content, actionId, createdBy: account.username });
    await actionDetail.save();

    return actionDetail;
};

const getActionById = async (actionId) => {
    try {
        const [action, actionDetail] = await Promise.all([
            Actions.findByIdAndUpdate(actionId, { $inc: { views: 1 } }, { new: true, lean: true }),
            ActionDetail.findOne({ actionId }).lean()
        ]);

        if (!action) throw new ApiErr(StatusCodes.NOT_FOUND, `Action not found with id: ${actionId}`);
        if (!actionDetail) throw new ApiErr(StatusCodes.NOT_FOUND, `ActionDetail not found with actionId: ${actionId}`);

        return { ...action, content: actionDetail.content };
    } catch (error) {
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, `Error retrieving action: ${error.message}`);
    }
};

const updateAction = async (id, data, file, account) => {
    try {
        const { content } = data;

        let images = null;
        if (file) {
            const uploadImage = await uploadSingleImageToCloudinary(file.path);
            images = uploadImage ? uploadImage.secure_url : null;
        }

        const updateFields = {
            ...data,
            updatedBy: account.username,
            ...(images && { images })
        };

        const [updatedAction, updatedActionDetail] = await Promise.all([
            Actions.findByIdAndUpdate(id, { $set: updateFields }, { new: true }),
            ActionDetail.findOneAndUpdate({ actionId: id }, { $set: { content, updatedBy: account.username } }, { new: true })
        ]);

        if (!updatedAction) throw new ApiErr(StatusCodes.NOT_FOUND, 'Action not found');
        if (!updatedActionDetail) throw new ApiErr(StatusCodes.NOT_FOUND, 'ActionDetail not found');

        return { updatedAction, updatedActionDetail };
    } catch (error) {
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, `Error updating action: ${error.message}`);
    }
};

const deleteAction = async (id) => {
    const action = await Actions.findById(id);
    if (!action) throw new ApiErr(StatusCodes.NOT_FOUND, 'Action not found');

    await Promise.all([
        ActionDetail.deleteOne({ actionId: action._id }),
        action.deleteOne()
    ]);

    return true;
};

const getTopViews = async () => {
    try {
        return await Actions.find().limit(8).sort({ views: -1 });
    } catch (error) {
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, `Error retrieving top views: ${error.message}`);
    }
};

const getFeatured = async () => {
    try {
        return await Actions.find({ isFeatured: true }).limit(5).sort({ createdAt: -1 });
    } catch (error) {
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, `Error retrieving featured actions: ${error.message}`);
    }
};

const searchActions = async (searchTerm, page, limit, startDate, endDate) => {
    try {
        const skip = (page - 1) * limit;
        const searchQuery = {
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { summary: { $regex: searchTerm, $options: 'i' } }
            ],
            ...(startDate && endDate && { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }),
            ...(startDate && !endDate && { createdAt: { $gte: new Date(startDate) } }),
            ...(!startDate && endDate && { createdAt: { $lte: new Date(endDate) } })
        };

        const [actions, totalCount] = await Promise.all([
            Actions.find(searchQuery).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
            Actions.countDocuments(searchQuery)
        ]);

        const actionIds = actions.map(item => item._id);
        const actionDetails = await ActionDetail.find({ actionId: { $in: actionIds } }).lean();

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
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, `Error searching actions: ${error.message}`);
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

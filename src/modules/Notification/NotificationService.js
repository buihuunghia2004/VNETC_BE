import {Notification} from "~/models/NotificationModel";
import {StatusCodes} from "http-status-codes";
import ApiErr from "~/utils/ApiError";

class notification {
    async addNotification(data) {
        try {
            const result = new Notification(data)
            if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, " Cant add Notification")
            return result
        } catch (e) {
            throw e
        }
    }

    async getNotication(id) {
        try {
            const result = await Notification.find({user_id: id})
            if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, " Cant find Notification")
            return result
        } catch (e) {
            throw e
        }
    }

    async getById(id) {
        try {
            const result = await Notification.findById(id)
            if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, " Cant find Notification")
            return result
        } catch (e) {
            throw e
        }
    }

    async deleteById(id) {
        try {
            const result = await Notification.findByIdAndDelete(id)
            if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, " Cant find Notification")
            return result
        } catch (e) {
            throw e
        }
    }
}

const notificationService = new notification();
export default notificationService;
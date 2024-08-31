import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";
import {LibraryVideo} from "~/models/libraryVideoModel";
import {LibraryImage} from "~/models/libraryImageModel";

function isValidUrl(input) {
    try {
        new URL(input);
        return true;
    } catch (err) {
        return false;
    }
}

class Video {
    async addVideoService(data, account) {
        if (!isValidUrl(data.video)) {
            throw new ApiErr(StatusCodes.BAD_REQUEST, "Invalid URL format");
        }

        const result = new LibraryVideo({
            ...data,
            createdBy: account.username
        });

        try {
            await result.save();
            return result;
        } catch (error) {
            throw new ApiErr(StatusCodes.BAD_REQUEST, "Failed to save video URL");
        }
    }

    async getVideo(page, limit) {
        page = Math.max(1, Math.floor(Number(page)));
        limit = Math.max(1, Math.floor(Number(limit)));

        const skip = limit * (page - 1);
        const get = await LibraryVideo.find().skip(skip).limit(limit);

        if (!get || get.length === 0) {
            throw new ApiErr(StatusCodes.NOT_FOUND, "No videos found");
        }

        return get;
    }
    async deleteVideo(id) {
        const result = await LibraryVideo.findByIdAndDelete(id)
        if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, "Cant find Image by ID");
        return result
    }
}

const videoService = new Video();

export default videoService;
import {SuccessRes} from "~/utils/SuccessRes";
import videoService from "~/modules/Video/videoService";

export const addVideo = async (req, res, next) => {
    try {
        const {body: data, account} = req
        console.log(account)
        const result = await videoService.addVideoService(data, account)
        SuccessRes(res, result, "Create Video success")
    } catch (error) {
        next(error)
    }
}
export const getVideo = async (req, res, next) => {
    try {
        const {page, limit} = req.query
        const result = await videoService.getVideo(page, limit)
        SuccessRes(res, result, "Get Video success")
    } catch (error) {
        next(error)
    }
}
export const deleteViddeo = async (req, res, next) => {
    try {
        const {params: {id}, account} = req
        const result = await videoService.deleteVideo(id)
        SuccessRes(res, result, "Delete Video success")
    } catch (error) {
        next(error)
    }
}
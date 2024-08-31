import {SuccessRes} from "~/utils/SuccessRes";
import ImageService from "~/modules/Image/ImageService";

export const addImage = async (req, res, next) => {
    try {
        const {files} = await req
        const result = await ImageService.addImage(files)
        SuccessRes(res, result, "Create Image success")
    } catch (error) {
        next(error)
    }
}
export const getImage = async (req, res, next) => {
    try {
        const result = await ImageService.getImage(req)
        SuccessRes(res, result, "Create Image success")
    } catch (e) {
        next(e)
    }
}
export const deleteImage = async (req, res, next) => {
    try {
        const result = await ImageService.deleteImage(req.params.id)
        SuccessRes(res, result, "Delete Image success")
    } catch (e) {
        next(e)
    }
}
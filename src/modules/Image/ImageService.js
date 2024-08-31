import uploadImageToCloudinary from "~/utils/uploadImage";
import {LibraryImage} from "~/models/libraryImageModel";
import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";

class ImageService {
    async addImage(files) {
        console.log(files)
        const uploadedImages = await uploadImageToCloudinary(files);

        const savedImages = await Promise.all(uploadedImages.map(async (imageUrl) => {
            const image = new LibraryImage({image: imageUrl});
            image.createdBy = 'admin';
            return await image.save();
        }));

        return savedImages;
    }

    async getImage(req) {
        const {page, limit} = req.query
        return LibraryImage.find().skip(limit * (page - 1)).limit(limit)
    }

    async deleteImage(id) {
        const result = await LibraryImage.findByIdAndDelete(id)
        if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, "Cant find Image by ID");
        return result
    }
}

const imageService = new ImageService();

export default imageService;
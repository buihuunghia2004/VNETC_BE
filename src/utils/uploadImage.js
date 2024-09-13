import cloudinary from "~/helper/cloundinary";

const uploadImageToCloudinary = async (filePaths) => {
    try {
        const uploadPromises = filePaths.map((filePath) =>
            cloudinary.uploader.upload(filePath.path, {
                crop: "limit",
                quality: "auto",
                fetch_format: "auto"
            })
        );

        const uploadResults = await Promise.all(uploadPromises);
        console.log(uploadResults);
        return uploadResults.map(result => result.secure_url);
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

module.exports = uploadImageToCloudinary;

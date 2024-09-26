import cloudinary from "~/helper/cloundinary"

const uploadSingleImageToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      },
      (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      }
    )
  })
}

module.exports = uploadSingleImageToCloudinary

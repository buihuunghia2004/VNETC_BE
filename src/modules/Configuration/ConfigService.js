import cloudinary from "~/helper/cloundinary"
import Configuration from "~/models/configurationModal"
import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";

class ConfigService {
    async addConfig(data, file, creator) {
        const uploadImage = new Promise((res, rej) => {
            // Tạo một mảng bằng Promise từ việc tải lên từng tệp
            const uploadPromises = file.map((file) => {
                return new Promise((resolve, reject) => {
                    cloudinary.uploader.upload(file.path, (err, result) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result.secure_url)
                        }
                    })
                })
            })

            // Sử dụng Promise.all để đợi tất cả các Promise hoàn thành
            Promise.all(uploadPromises)
                .then((uploadUrls) => {
                    res(uploadUrls)
                })
                .catch((err) => {
                    rej(err)
                })
        })
        console.log(data)
        try {
            const uploadUrls = await uploadImage
            const homepageSlider = uploadUrls.map((url, index) => {
                return {
                    Id: Date.now() + index, // Sử dụng timestamp hiện tại và thêm index để tạo Id
                    title: data.title[index],
                    image_url: url,
                    position: data.position[index],
                }
            })

            const config = new Configuration()
            config.name = data.name
            config.homepage_slider = JSON.stringify(homepageSlider)
            config.contact_email = data.contact_email
            config.phone_number = data.phone_number
            config.created_at = new Date().toISOString()
            config.updated_at = new Date().toISOString()
            config.createBy = creator
            await config.save()
            return config
        } catch (err) {
            console.error("Error uploading images:", err)
        }
    }

    async getAll(query) {
        const {page = 0, limit = 8} = query
        const Config = await Configuration.find()
            .skip(page * limit)
            .limit(limit)
        return Config
    }

    async getConfig(id) {
        try {
            const config = await Configuration.findById(id)
            if (!config) {
                throw new ApiErr(444, "Find fail")
            }
            return config
        } catch (error) {
            next(error)
        }
    }

    async deleteConfig(id) {
        try {
            const deleted = await Configuration.findByIdAndDelete(id)
            if (!deleted) {
                throw new ApiErr(444, "Delete fail")
            }
            return deleted
        } catch (error) {
            next(error)
        }
    }

    async updateConfig(id, data) {
        try {
            const homepageSlider = data.image.map((image, index) => {
                return {
                    Id: Date.now() + index,
                    title: data.title[index],
                    image_url: image,
                    position: data.position[index],
                }
            });
            const result = await Configuration.findByIdAndUpdate(id, {
                data, homepage_slider: JSON.stringify(homepageSlider)
            })
            if (!result) throw new ApiErr(StatusCodes.BAD_REQUEST, "Cant Update Config");
            console.log(homepageSlider);
            return result
        } catch (e) {
            throw e;
        }
    }
}

const configService = new ConfigService()

export default configService

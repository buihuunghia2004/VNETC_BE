import {ServiceModel} from "~/models/serviceModel";
import {ServiceDetailModel} from "~/models/serviceDetailModel";
import ApiErr from "~/utils/ApiError";
import {StatusCodes} from "http-status-codes";
import uploadSingleImageToCloudinary from "~/utils/uploadSingleImage";

class SerService {
    async addService(data, file) {
        try {
            const uploadedImage = await uploadSingleImageToCloudinary(file.path);
            const service = new ServiceModel(data);
            service.image = uploadedImage.secure_url
            await service.save();

            const newOrder = new ServiceDetailModel({
                serviceId: service._id,
                content: data.content,
                createdBy: data.createdBy
            });
            await newOrder.save();

            return [service, newOrder];
        } catch (e) {
            throw e;
        }
    }

    async getService({page, limit, type}) {
        try {
            const query = type ? {serviceType: type} : {};
            const service = await ServiceModel.find(query).skip(limit * (page - 1)).limit(limit).sort({createdAt: -1})
            return service
        } catch (e) {
            throw e
        }
    }

    async deleteService(serviceId) {
        try {
            await ServiceDetailModel.deleteMany({serviceId: serviceId});
            const result = await ServiceModel.findByIdAndDelete(serviceId);
            if (!result) {
                throw new Error('Service not found');
            }

            return result;
        } catch (e) {
            throw e;
        }
    }

    async updateService(serviceId, data, file) {
        try {
            // Xử lý việc upload file nếu có
            let imageUrl;
            if (file) {
                const uploadedImage = await uploadSingleImageToCloudinary(file.path);
                imageUrl = uploadedImage.secure_url;
            }

            // Cập nhật service
            const serviceUpdateData = {
                name: data.name,
                description: data.description,
            };

            if (imageUrl) {
                serviceUpdateData.image = imageUrl;
            }

            const service = await ServiceModel.findByIdAndUpdate(
                serviceId,
                {$set: serviceUpdateData},
                {new: true, runValidators: true}
            );

            if (!service) {
                throw new Error('Không tìm thấy dịch vụ');
            }

            // Cập nhật hoặc tạo mới serviceDetail
            const serviceDetailUpdateData = {
                content: data.content,
                createdBy: data.createdBy,
            };

            const serviceDetail = await ServiceDetailModel.findOneAndUpdate(
                {serviceId: service._id},
                {$set: serviceDetailUpdateData},
                {new: true, upsert: true, runValidators: true}
            );

            return [service, serviceDetail];
        } catch (e) {
            throw e;
        }
    }


    async getServiceById(serviceId) {
        try {
            const service = await
                ServiceModel.findByIdAndUpdate(
                    serviceId,
                    {$inc: {views: 1}},
                    {new: true, lean: true});
            if (!service) {
                throw new ApiErr(StatusCodes.BAD_REQUEST, "Service detail not found");
            }

            const serviceDetails = await ServiceDetailModel.findOne({serviceId: serviceId});
            if (!serviceDetails) {
                throw new ApiErr(StatusCodes.BAD_REQUEST, "Service details not found");
            }
            const data = {
                _id: service._id,
                name: service.name,
                views: service.views,
                createdBy: service.createdBy,
                updatedBy: service.updatedBy,
                image: service.image,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
                content: serviceDetails.content // Ensure content is included
            };
            return data;
        } catch (e) {
            throw e;
        }
    }

    async getByTopViews() {
        try {
            const data = await ServiceModel.find()
                .limit(8)
                .sort({views: -1});
            return data
        } catch (e) {
            throw e
        }
    }

    async getFeatured() {
        try {
            return await ServiceModel.find({isFeatured: true}).limit(5).sort({createdAt: -1})
        } catch (e) {
            throw e
        }
    }
}


const Service = new SerService()

export default Service
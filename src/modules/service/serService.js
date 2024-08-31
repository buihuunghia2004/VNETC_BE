import { ServiceModel } from "~/models/serviceModel"
import { ServiceDetailModel } from "~/models/serviceDetailModel"
import ApiErr from "~/utils/ApiError"
import { StatusCodes } from "http-status-codes"
import uploadSingleImageToCloudinary from "~/utils/uploadSingleImage"
import { News, NewsDetail } from "~/models/newsModel"

class SerService {
  async addService(data, file) {
    try {
      console.log(file)
      const uploadedImage = await uploadSingleImageToCloudinary(file.path)
      const service = new ServiceModel(data)
      service.image = uploadedImage.secure_url
      await service.save()

      const newOrder = new ServiceDetailModel({
        serviceId: service._id,
        content: data.content,
        createdBy: data.createdBy,
      })
      await newOrder.save()

      return [service, newOrder]
    } catch (e) {
      throw e
    }
  }

  async getService({ page, limit, categoryId }) {
    try {
      // Kiểm tra và thiết lập giá trị mặc định cho page và limit
      const validPage = Math.max(1, parseInt(page) || 1) // Đảm bảo page >= 1
      const validLimit = Math.max(1, parseInt(limit) || 10) // Đảm bảo limit >= 1

      const query = categoryId ? { categoryId } : {}
      const service = await ServiceModel.find(query)
        .skip(validLimit * (validPage - 1))
        .limit(validLimit)
        .sort({ createdAt: -1 })

      // Kiểm tra nếu không có kết quả
      if (service.length === 0) {
        return { message: "No services found" }
      }

      return service
    } catch (e) {
      console.error("Error fetching services:", e.message) // Ghi log lỗi
      throw new Error("An error occurred while fetching services") // Thông báo lỗi cụ thể hơn
    }
  }

  async deleteService(serviceId) {
    try {
      await ServiceDetailModel.deleteMany({ serviceId: serviceId })
      const result = await ServiceModel.findByIdAndDelete(serviceId)
      if (!result) {
        throw new Error("Service not found")
      }

      return result
    } catch (e) {
      throw e
    }
  }

  async updateService(serviceId, data, file) {
    try {
      // Xử lý việc upload file nếu có
      let imageUrl
      if (file) {
        const uploadedImage = await uploadSingleImageToCloudinary(file.path)
        imageUrl = uploadedImage.secure_url
      }

      // Cập nhật service
      const serviceUpdateData = {
        name: data.name,
        description: data.description,
      }

      if (imageUrl) {
        serviceUpdateData.image = imageUrl
      }

      const service = await ServiceModel.findByIdAndUpdate(
        serviceId,
        { $set: serviceUpdateData },
        { new: true, runValidators: true }
      )

      if (!service) {
        throw new Error("Không tìm thấy dịch vụ")
      }

      // Cập nhật hoặc tạo mới serviceDetail
      const serviceDetailUpdateData = {
        content: data.content,
        createdBy: data.createdBy,
      }

      const serviceDetail = await ServiceDetailModel.findOneAndUpdate(
        { serviceId: service._id },
        { $set: serviceDetailUpdateData },
        { new: true, upsert: true, runValidators: true }
      )

      return [service, serviceDetail]
    } catch (e) {
      throw e
    }
  }

  async getServiceById(serviceId) {
    try {
      const service = await ServiceModel.findByIdAndUpdate(
        serviceId,
        { $inc: { views: 1 } },
        { new: true, lean: true }
      )
      if (!service) {
        throw new ApiErr(StatusCodes.BAD_REQUEST, "Service detail not found")
      }

      const serviceDetails = await ServiceDetailModel.findOne({
        serviceId: serviceId,
      })
      if (!serviceDetails) {
        throw new ApiErr(StatusCodes.BAD_REQUEST, "Service details not found")
      }
      const data = {
        ...service,
        content: serviceDetails.content, // Ensure content is included
      }
      return data
    } catch (e) {
      throw e
    }
  }

  async getByTopViews() {
    try {
      const data = await ServiceModel.find().limit(8).sort({ views: -1 })
      return data
    } catch (e) {
      throw e
    }
  }

  async getFeatured() {
    try {
      return await ServiceModel.find({ isFeatured: true })
        .limit(5)
        .sort({ createdAt: -1 })
    } catch (e) {
      throw e
    }
  }

  async search(searchTerm, page, limit) {
    try {
      const skip = (page - 1) * limit
      const searchQuery = {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { summary: { $regex: searchTerm, $options: "i" } },
        ],
      }
      const [service, totalCount] = await Promise.all([
        ServiceModel.find(searchQuery)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        ServiceModel.countDocuments(searchQuery),
      ])
      const newsIds = service.map((item) => item._id)
      const newsDetails = await ServiceDetailModel.find({
        newsId: { $in: newsIds },
      })
      const fullResults = service.map((newsItem) => {
        const detail = newsDetails.find(
          (detail) => detail.newsId.toString() === newsItem._id.toString()
        )
        return {
          ...newsItem.toObject(),
          content: detail ? detail.content : null,
        }
      })
      return {
        results: fullResults,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      }
    } catch (error) {
      console.error("Error searching :", error)
      throw new ApiErr(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Error searching news"
      )
    }
  }
}

const Service = new SerService()

export default Service

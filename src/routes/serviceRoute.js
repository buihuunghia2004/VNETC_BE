import {Router} from "express"
import isAuth from "~/middlewares/authMiddleware"
import {upload} from "~/middlewares/multipleUploadMiddleware"
import {
    addService,
    deleteService, getByFeatured, getByTopViews,
    getService,
    getServiceById, search,
    updateService
} from "~/modules/service/serviceController";

const Service = Router()
Service.post("/", isAuth, upload.single("image"), addService)
Service.get("/", getService)
Service.get("/views", getByTopViews)
Service.get("/featured", getByFeatured)
Service.get("/search", search)
Service.get('/:id', getServiceById)
Service.patch('/:id', isAuth, upload.single("image"), updateService)
Service.delete("/:id", isAuth, deleteService)
export const ServiceRoute = Service
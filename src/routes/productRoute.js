import express from "express"
import isAuth from "~/middlewares/authMiddleware"
import {upload} from "~/middlewares/multipleUploadMiddleware"
import {productController as control} from "~/modules/product/productController"

const Router = express.Router()

// Router.route("/")
//     .post( upload.single("image"), control.create)
//     .get(control.getAll)
// Router.route("/:id")
//     .get( control.getProductById)
//     .patch( upload.single("updateImage"), control.updateProduct)
//     .delete( control.deleteProduct)
//
// Router.route("/:id/detail")
//     .post( control.createNewsDetail)
//     // .get(isAuth, control.getAllProductDetail)
//
// Router.route("/:id/detail/:productId")
//     .patch( control.updateProductDetail)
Router.route("/")
    .post(isAuth,upload.array("images"), control.create)
    .get(control.getAll)
Router.route("/search").get(control.searchProductsController)
Router.route("/:id")
    .get(control.getProductById)
    .patch(isAuth,upload.array("updateImage"), control.updateProduct)
    .delete(isAuth,control.deleteProduct)

// .get(isAuth, control.getAllProductDetail)


export const productRoute = Router

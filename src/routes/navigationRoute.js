import express from "express"
import isAuth from "~/middlewares/authMiddleware"
import { navigationController as controller } from "~/modules/navigation/navigationController"
import { navigationValidation as validation } from "~/validations/navigationValidation"
const Router = express.Router()

//http://localhost:8686/navigation
Router.route("/")
  .get(controller.getNavigation)
  .post(isAuth, validation.addNavigation, controller.addNavigation)
  .delete(isAuth, controller.deleteNavigation)
Router.route("/:id").get(controller.getNaigationById).patch(isAuth, controller.updateNavigation)
Router.route("/:slug").get(controller.getNaigationBySlug)

export const navigationRoute = Router

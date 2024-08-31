import express from 'express'
import {upload} from "~/middlewares/multipleUploadMiddleware";
import isAuth from "~/middlewares/authMiddleware";
import {actionController} from "~/modules/actionModule/actionController";

const Router = express.Router()

Router.route('/')
    .post(isAuth, upload.single('images'), actionController.addAction)
    .get(actionController.getActions)
Router.route('/views').get(actionController.getTopViews)
Router.route('/featured').get(actionController.getFeatured)
Router.route('/search').get(actionController.search)
Router.route('/:id')
    .post(isAuth, actionController.addActionDetail)
    .get(actionController.getActionById)
    .delete(isAuth, actionController.deleteAction)
    .patch(isAuth, upload.single('images'), actionController.updateAction)

export const actionRoute = Router

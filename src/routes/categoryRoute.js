import express from 'express'
import { categoryController as controller} from '~/modules/category/categoryController'
import isAuth from "~/middlewares/authMiddleware";
const Router = express.Router()

Router.route('/')
    .get(controller.getCates)
    .post(isAuth,controller.addCategory)
Router.route('/:id')
    .delete(isAuth,controller.deleteCate)
Router.route('/type').get(controller.getByType)

export const categoryRoute = Router
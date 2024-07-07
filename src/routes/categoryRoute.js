import express from 'express'
import { categoryController as controller} from '~/modules/category/categoryController'
import isAuth from "~/middlewares/authMiddleware";
const Router = express.Router()

Router.route('/')
    .get(controller.getCates)
    .post(isAuth,controller.addCategory)
Router.route('/:id')
    .delete(controller.deleteCate)    

export const categoryRoute = Router
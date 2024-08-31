import express from 'express'
import isAuth from '~/middlewares/authMiddleware'
import { upload } from '~/middlewares/multipleUploadMiddleware'
import { partnerController as controll} from '~/modules/partner/partnerController'
const Router = express.Router()

Router.route('/:id')
    .delete(isAuth,controll.deleteById)

Router.route('/')
    .post(isAuth,upload.single('image'), controll.create)
    .get(controll.getAll)

export const partnerRoute = Router
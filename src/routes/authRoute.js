import express from 'express'
import {authController} from '~/modules/authen/authController'
import {authValidation} from '~/validations/authValidation'

const Router = express.Router()

Router.route('/login')
    .post(authValidation.login, authController.login)
Router.route('/logout').post(authController.logout)

export const authRoute = Router
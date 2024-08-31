import {SuccessRes} from "~/utils/SuccessRes"
import {authService} from "./authService"

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body.email, req.body.password)
        SuccessRes(res, result, 'Login success!')
    } catch (error) {
        next(error)
    }
}
const logout = async (req, res, next) => {
    try {
        const result = await authService.logout()
        SuccessRes(res, result, 'logout success!')
    } catch (e) {
        next(e)
    }
}

export const authController = {
    login,
    logout
}
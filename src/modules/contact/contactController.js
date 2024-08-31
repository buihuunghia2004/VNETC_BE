import { SuccessRes } from "~/utils/SuccessRes"
import { contactService } from "./contactService"

const sendMessage = async (req, res, next) => {
    try {
        const sended = await contactService.sendMessage(req.body)
        SuccessRes(res, sended, 'Send message succesful')
    } catch (error) {
        next(error)
    }
}
const getMessage = async (req, res, next) => {
    try {
        const messages = await contactService.getMessage(req.query)
        SuccessRes(res, messages, 'Get messages succesful')
    } catch (error) {
        next(error)
    }
}
const deleteMessage = async (req, res, next) => {
    try {
       const sended = await contactService.deleteMessage(req.params.id)
        SuccessRes(res, sended, 'Delete message succesful')
    } catch (error) {
        next(error)
    }
}

export const contactController = {
    sendMessage,
    getMessage,
    deleteMessage
}
import ApiErr from "~/utils/ApiError"
import {departmentService} from "./departmentService"
import {SuccessRes} from "~/utils/SuccessRes"

const create = async (req, res, next) => {
    try {
        const created = await departmentService.create(req.body, req.account.username)
        if (!created) {
            throw new ApiErr(444, 'Create fail')
        }
        SuccessRes(res, created, 'Creat successful!')
    } catch (error) {
        next(error)
    }
}
const getAll = async (req, res, next) => {
    try {
        const deparments = await departmentService.getAll()
        SuccessRes(res, deparments, 'Get departments successful!')
    } catch (error) {
        next(error)
    }
}

const createMember = async (req, res, next) => {
    try {
        const {body: data, params: {id}, file} = req
        const result = await departmentService.createMember(id, data, file, req.account.username)
        SuccessRes(res, result, ' Create Member Success')
    } catch (e) {
        next(e)
    }
}
const deleteDepartment = async (req, res, next) => {
    try {
        const result = await departmentService.deleteDepartment(req.params.id)
        SuccessRes(res, result, ' Delete Success')
    } catch (e) {
        next(e)
    }
}
const updateDepartment = async (req, res, next) => {
    try {
        const id = req.params.id
        const data = req.body
        const file = req.file
        const result = await departmentService.updateDepartment(id, data, file, req.account.username)
        SuccessRes(res, result, 'Updated Department')
    } catch (e) {
        next(e)
    }
}
const updateMember = async (req, res, next) => {
    try {
        const id = req.params.memberId
        const data = req.body
        const result = await departmentService.updatedMember(id, data)
        SuccessRes(res, result, 'Updated Member')
    } catch (e) {
        next(e)
    }
}
const getMember = async (req, res, next) => {
    try {
        const id = req.params.id
        const pagi = req.query
        const result = await departmentService.getMember(id, pagi)
        SuccessRes(res, result, 'Get Member Success')
    } catch (e) {
        next(e)
    }
}
const deleteMember = async (req, res, next) => {
    try {
        const id = req.params.memberId
        const result = await departmentService.deleteMember(id)
        SuccessRes(res, result, 'Delete Member Success')
    } catch (e) {
        next(e)
    }
}
const getMemberById = async (req, res, next) => {
    try {
        const id = req.params.memberId
        const result = await departmentService.getMemberById(id)
        SuccessRes(res, result, 'Delete Member Success')
    } catch (e) {
        next(e)
    }
}
export const departmentController = {
    create,
    getAll,
    createMember,
    deleteDepartment, updateDepartment, updateMember, getMember, deleteMember, getMemberById
}
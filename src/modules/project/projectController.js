import ApiErr from "~/utils/ApiError";
import {SuccessRes} from "~/utils/SuccessRes";

import projectService from "~/modules/project/projectService";
import {Project} from "~/models/projectModel";
import {newsService} from "~/modules/news/newsService";

export const addProject = async (req, res, next) => {
    try {
        const {body: data, file, account} = await req
        const result = await projectService.addProject(data, file, account)
        SuccessRes(res, result, "Create new Service success")
    } catch (error) {
        next(error)
    }
}
export const getProject = async (req, res, next) => {
    try {
        const data = req.query
        const result = await projectService.getProject(data)
        SuccessRes(res, result, "Get Project success")
    } catch (error) {
        next(error)
    }
}
export const getProjectById = async (req, res, next) => {
    try {
        const id = req.params.id
        const result = await projectService.getProjectById(id)
        SuccessRes(res, result, "Get Project by id success")
    } catch (e) {
        next(e)
    }
}
export const updateProject = async (req, res, next) => {
    try {
        const id = req.params.id
        const data = req.body
        const file = req.file
        const account = req.account
        const result = await projectService.updateProject(id, data, file, account)
        SuccessRes(res, result, "Update Project success")
    } catch (e) {
        next(e)
    }
}
export const deleteProject = async (req, res, next) => {
    try {
        const id = req.params.id
        const result = await projectService.deleteProject(id)
        SuccessRes(res, result, "Delete Project success")
    } catch (e) {
        next(e)
    }
}
export const getByTopViews = async (req, res, next) => {
    try {
        const result = await projectService.getByTopViews()
        SuccessRes(res, result, "Get by Top Views Success")
    } catch (e) {
        next(e)
    }
}

export  const search = async (req,res,next) =>{
    try {
        const {data, page, limit} = req.query
        const result = await projectService.searchProjects(data, page, limit)
        SuccessRes(res, result, 'Get Project Successs')
    } catch (e) {
        next(e)
    }
}

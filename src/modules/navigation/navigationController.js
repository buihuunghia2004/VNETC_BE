import { navigationService } from "./navigationService"
import { SuccessRes } from "~/utils/SuccessRes"

const getNavigation = async (req, res, next) => {
  try {
    const re = await navigationService.getAllNavigation()
    SuccessRes(res, re, "Get navigation succesful")
  } catch (error) {
    next(error)
  }
}

const getNaigationBySlug = async (req, res, next) => {
  try {
    const result = await navigationService.getNavigationBySlug(req.params.slug)
    SuccessRes(res, result, "Get navigation successful")
  } catch (error) {
    next(error)
  }
}

const addNavigation = async (req, res, next) => {
  try {
    const added = await navigationService.addNavigation(req.body,req.account.username)
    SuccessRes(res, added, "Add navigation successful")
  } catch (error) {
    next(error)
  }
}

const deleteNavigation = async (req, res, next) => {
  try {
    const deleted = await navigationService.deleteNaigation(req.body)
    SuccessRes(res, deleted, "Delete successful")
  } catch (error) {
    next(error)
  }
}

export const navigationController = {
  getNavigation,
  getNaigationBySlug,
  addNavigation,
  deleteNavigation,
}

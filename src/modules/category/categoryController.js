import { StatusCodes } from "http-status-codes"
import { categoryService } from "./categoryService"
import { SuccessRes } from "~/utils/SuccessRes"
import { categoryModel } from "~/models/categoryModel"

const addCategory = async (req, res, next) => {
  try {
    const profile = req.account
    console.log(req)
    const added = await categoryService.addCategory(req.body, profile)
    SuccessRes(res, added, "Add category successful")
  } catch (error) {
    next(error)
  }
}
const getCates = async (req, res, next) => {
  try {
    const cates = await categoryService.getCategories()
    SuccessRes(res, cates, "Get categories successful")
  } catch (error) {
    next(error)
  }
}
const updateCate = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = req.body
    const profile = req.account
    const result = await categoryService.updateCategory(id, data, profile)
    SuccessRes(res, result, "Update Categories Successfully")
  } catch (error) {
    next(error)
  }
}
const getByType = async (req, res, next) => {
  try {
    const { value } = req.query
    const result = await categoryService.getCategoriesByType(value)
    SuccessRes(res, result, "Get categories successful")
  } catch (e) {
    next(e)
  }
}
const getCateById = async (req, res, next) => {
  try {
    const id = req.params.id
    console.log(id)
    const category = await categoryService.getCategoryById(id)
    SuccessRes(res, category, "Get category successful")
  } catch (error) {
    next(error)
  }
}
const deleteCate = async (req, res, next) => {
  try {
    const deleted = await categoryService.deleteCategory(req.params.id)
    SuccessRes(res, deleted, "Deleted successful")
  } catch (error) {
    next(error)
  }
}

export const categoryController = {
  addCategory,
  getCates,
  deleteCate,
  getByType,
  updateCate,
  getCateById,
}

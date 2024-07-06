import mongoose from "mongoose"
import {News} from "./newsModel"
import slugify from "~/utils/stringToSlug"
import {Cat_type} from "~/utils/appConst";

const {Schema} = mongoose

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String,
        default: null
    },
}, {timestamps: true})

export const Category = mongoose.model('Category', categorySchema)


const getCates = async () => {
    const cates = await Category.find()
    return cates
}

const updateCate = async (data) => {
    const {id, name, updatedBy} = data

    const updated = await Category.findByIdAndUpdate(id, {name, updatedBy})

    if (!updated) {
        throw new Error('Update fail')
    }
    return updated
}

const deleteCate = async (id) => {

    const cate = await Category.findById(id)
    if (!cate) {
        throw new Error('Category not found')
    }

    const newsExists = await News.exists({categoryId: cate._id.toString()})
    if (newsExists) {
        throw new Error('Lỗi khóa ngoại')
    }

    await Category.findByIdAndDelete(id)

    return true
}

export const categoryModel = {
    createNew,
    updateCate,
    getCates,
    deleteCate
}
import mongoose from "mongoose"
import {Category} from "./categoryModel"
import {Account, accountModel} from "./accountModel"

const {Schema} = mongoose

const actionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    images: {
        type: String,
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
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

const actionDetailSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    actionId: {
        type: Schema.Types.ObjectId,
        ref: 'News'
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


export const ActionDetail = mongoose.model('ActionDetail', actionDetailSchema)
export const Actions = mongoose.model('Actions', actionSchema)
import mongoose from "mongoose"
import { Category } from "./categoryModel"
import { Account, accountModel } from "./accountModel"
const { Schema } = mongoose

const newsSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    summary:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    images:{
        type:String,
        required:true
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Category'
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String,
        default: null
    },
}, { timestamps: true })

const newsDetailSchema = new Schema({
    content:{
        type:String,
        required:true
    },
    newsId:{
        type:Schema.Types.ObjectId,
        ref:'News'
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String,
        default: null
    },
}, { timestamps: true })


export const NewsDetail = mongoose.model('NewsDetail', newsDetailSchema)
export const News = mongoose.model('News', newsSchema)
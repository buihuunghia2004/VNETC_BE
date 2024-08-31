import mongoose from "mongoose"
import {News} from "./newsModel"
import slugify from "~/utils/stringToSlug"
import {Cat_type} from "~/utils/appConst";

const {Schema, Types} = mongoose

const subcategorySchema = new Schema({
    _id: {
        type: Types.ObjectId,
        default: Types.ObjectId
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    }
});

const categorySchema = new Schema({
    _id: {
        type: Types.ObjectId,
        default: Types.ObjectId
    },
    name: {
        type: String,
        required: true
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
    subcategories: [subcategorySchema],
}, {timestamps: true})

export const Category = mongoose.model('Category', categorySchema)
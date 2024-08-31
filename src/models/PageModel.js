import mongoose from "mongoose"

const {Schema} = mongoose

const PageSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    createdBy: {
        type: String,
        require: true
    },
    updatedBy: {
        type: String,
        default: "null"
    }
})
export const PageModel = mongoose.model('Page', PageSchema)
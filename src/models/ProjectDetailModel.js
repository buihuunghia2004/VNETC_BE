import mongoose from "mongoose"

const {Schema} = mongoose

const projectDetailSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceModel'
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

export const projectDetail= mongoose.model('ProjectDetail', projectDetailSchema)
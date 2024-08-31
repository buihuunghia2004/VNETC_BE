import mongoose from "mongoose"
import {number} from "joi";

const {Schema} = mongoose

const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    summary: {
        type: String,
        default: ''
    },
    views: {
        type: Number,
        default: 0
    },
    // isFeatured: {
    //     type: Boolean,
    //     default: false
    // },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String,
        default: null
    },
    projectType: {
        type: Number,
        enum: [0, 1, 2, 3, 4],
        required: true
    }
}, {timestamps: true})

export const Project = mongoose.model('Project', projectSchema)
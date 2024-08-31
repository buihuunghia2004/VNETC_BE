import mongoose from "mongoose"

const {Schema} = mongoose

const libraryVideoSchema = new Schema({
    video: {
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

export const LibraryVideo = mongoose.model('LibraryVideo', libraryVideoSchema)
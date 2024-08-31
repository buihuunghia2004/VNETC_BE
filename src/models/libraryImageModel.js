import mongoose from "mongoose"

const {Schema} = mongoose

const libraryImageSchema = new Schema({
    image: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String,
        default: 'null'
    },
}, {timestamps: true})

export const LibraryImage = mongoose.model('LibraryImage', libraryImageSchema)
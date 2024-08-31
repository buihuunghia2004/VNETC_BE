import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const AttachmentSchema = new Schema({
    filename: {
        type: String,
        required: true
    },
    file_type: {
        type: String,
        required: true
    },
    file_url: {
        type: String,
        required: true
    },
});

const DocumentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        enum: [0,1,2,3],
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
    attachments: {
        type: [AttachmentSchema],
        required: true
    }
},{ timestamps: true });

DocumentSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

export const DocumentModel = mongoose.model('Document', DocumentSchema);

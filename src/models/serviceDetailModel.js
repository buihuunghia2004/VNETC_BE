import mongoose from "mongoose"

const {Schema} = mongoose

const serviceDetailSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    serviceId: {
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

export const ServiceDetailModel = mongoose.model('ServiceDetail', serviceDetailSchema)
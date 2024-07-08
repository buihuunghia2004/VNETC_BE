import mongoose from "mongoose"
const { Schema } = mongoose

const productDetailSchema = new Schema({
    brand:String, //thương hiệu
    wattage:Number, //công suất
    // species:String,
    weight:Number, //trọng lượng
    size:String, //kích thước
    warranty:Number,//bảo hành

    productId:{
        type:Schema.Types.ObjectId,
        ref:'Product'
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

export const ProductDetail = mongoose.model('ProductDetail', productDetailSchema)
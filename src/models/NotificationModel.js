import mongoose from "mongoose"

const {Schema} = mongoose
const notificationSchema = new Schema({
    user_id: {type: String, require: true},
    message: {type: String, require: true},
    read: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now}
});

export const Notification = mongoose.model("Notification ", notificationSchema)
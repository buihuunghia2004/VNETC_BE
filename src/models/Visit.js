import mongoose from 'mongoose'

const VisitSchema = new mongoose.Schema({
    count: Number
})

export const Visit = mongoose.model('Visit', VisitSchema)
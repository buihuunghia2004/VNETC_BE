const {default: mongoose} = require("mongoose");
const {env} = require("./environment");

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}
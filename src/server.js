import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import http from 'http'
import {Server} from 'socket.io'
import {env} from './config/environment'
import initApis from './routes/api'
import {setupSocketIO} from './modules/socketService'
import {connectToDatabase} from './config/mongodb'
import {errorHandlingMiddleWare} from "~/middlewares/errorHandlingMiddleWare";
import path from 'path';
const app = express()
const server = http.createServer(app)
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// Middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
app.use(morgan('dev'))
// Thiết lập đường dẫn tĩnh cho thư mục 'uploads'
app.use('/uploads', express.static(path.join(__dirname,'..', 'uploads')));

// Database connection
connectToDatabase()

// Socket.IO setup
setupSocketIO(io)

// Routes
initApis(app)

// Error handling
app.use(errorHandlingMiddleWare)

// Start server
const startServer = () => {
    server.listen(env.PORT, () => {
        console.log(`Server running at: http://localhost:${env.PORT}/`)
    })
}

startServer()
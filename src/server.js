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

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
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
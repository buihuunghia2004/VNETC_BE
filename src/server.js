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
import * as fs from 'fs';
import https from 'https';
const app = express()


const privateKey = fs.readFileSync('privkey.pem')
const certificate = fs.readFileSync('fullchain.pem')
const credentials = { key: privateKey, cert: certificate }

// Create HTTPS server
const server = https.createServer(credentials, app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// Middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({credentials:true}))
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
    server.listen(443, () => {
        console.log(`Server running at: http://localhost:443/`)
    })
}

startServer()

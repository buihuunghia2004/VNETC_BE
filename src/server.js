import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import http from 'http'
import { env } from './config/environment'
import { errorHandlingMiddleWare } from './middlewares/errorHandlingMiddleWare'
import navigationRoute from './routes/navigationRoute'
import { accountRoute } from './routes/accountRoute'
import { categoryRoute } from './routes/categoryRoute'
import { newsRoute } from './routes/newsRoute'
import { partnerRoute } from './routes/partnerRoute'
import { contactRoute } from './routes/contactRoute'

const app = express()
const server = http.createServer(app,()=>{
  const clientIP = req.connection.remoteAddress;
  console.log('Client IP:', clientIP);
})
const io = require('socket.io')(server,{
  cors: {
    origin: '*'
  }
})

app.use(cors())
app.use(bodyParser.json())
app.use(morgan('dev'))

mongoose.connect(env.MONGODB_URI)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Connected to MongoDB')
});

let onlineUser = 0;
io.on('connection', (socket) => {

  onlineUser+=1
  console.log(onlineUser)

  socket.on('disconnect', () => {
      // onlineUsers--;
      onlineUser-=1
      console.log(onlineUser);
  });
});

// Cho phép lý dữ liệu từ form method POST
app.use(express.urlencoded({extended: true}));

//routes
// app.use('/',(req,res)=> {
//   res.send('ok')
// })
app.use('/navigation',navigationRoute)
app.use('/account',accountRoute)
app.use('/category',categoryRoute)
app.use('/news',newsRoute)
app.use('/partner',partnerRoute)
app.use('/contact',contactRoute)
//middleware error handler
app.use(errorHandlingMiddleWare)


server.listen(env.PORT, () => {
  console.log(`Server running at:${ env.PORT }/`)
})
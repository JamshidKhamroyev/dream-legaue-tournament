const cookieParser = require('cookie-parser')
const express = require('express')
require('dotenv').config()
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors')

const app = express()
app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }))
app.use(express.json())
app.use(cookieParser())

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }})

let users = []

const getSocketId = (userId) => {
    const user = users.find(user => user.user._id === userId)
    return user ? user.socketId : null
}

const addOnlineUser = (user, socketId) => {
    const checkUser = users.find(u => u.user._id === user._id)
    if(!checkUser){
        users.push({ user, socketId })
    }
}
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("addOnlineUser", user => {
        addOnlineUser(user, socket.id)
        io.emit('getOnlineUsers', users)
    })

    socket.on("addNewParticipant", tournament => {
        io.emit("getTournament", tournament)
    })
    
    socket.on("disconnect", () => {
        users = users.filter(u => u.socketId !== socket.id);
        io.emit("getOnlineUsers", users)   
    })
})
  

app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/tournament', require('./routes/tourner.route'))

server.listen(process.env.PORT, () => console.log(`Server running on localhost:${process.env.PORT}`))
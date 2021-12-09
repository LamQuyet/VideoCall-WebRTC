const express = require("express")
const app = express()
const port = 3000
const http = require("http")
const server = http.createServer(app)
const io = require("socket.io")(server)

io.on("connection", socket => {
    console.log("Someone conected");
    socket.on("disconnect", () => {
        console.log("someone disconnected!!!")
    })
    socket.on('OfferAnswer', (offer) => {
        console.log(offer)
        socket.broadcast.emit('calling', offer)
    })
    socket.on('candidate', (candidate) => {
        console.log('CANDIDATE', candidate)
        socket.broadcast.emit('candidate1', candidate)
    })
})

server.listen(port, () => console.log("http://localhost:" + port));
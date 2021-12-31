const express = require("express")
const app = express()
const port = 3000
const http = require("http")
const server = http.createServer(app)
const io = require("socket.io")(server)

let ID = []
io.on("connection", socket => {
    console.log("Someone conected", socket.id);
    ID.push(socket.id)
    io.emit('id', ID)

    socket.on("disconnect", () => {
        ID = ID.filter(id => id != socket.id)
        io.emit('id', ID)
    })
    socket.on('OfferAnswer', (data) => {
        console.log(data)
        if (data.desc.type == 'offer') {
            io.to(data.remoteID).emit('calling', { ID: data.localID, desc: data.desc })
        }
        if (data.desc.type == 'answer') {
            io.to(data.remoteID).emit('calling', { desc: data.desc })
        }
    })
    socket.on('candidate', (data) => {
        console.log('CANDIDATE', data)
        io.to(data.remoteID).emit('candidate1', data.ice)
    })
    socket.on('endcall', (id) => {
        io.to(id).emit('endcall1', 'end')
    })
})

server.listen(port, () => console.log("http://localhost:" + port));
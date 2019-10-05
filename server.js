const server = require('http').createServer()
const mongoose = require('mongoose')
const { player, lobby } = require('./models')

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true})

const io = require('socket.io')(server, {
    path: '/socket.io'
})

server.listen(3000)
const server = require('http').createServer()

const io = require('socket.io')(server, {
    path: '/socket.io'
})

server.listen(3000)
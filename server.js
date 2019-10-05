const server = require('http').createServer()
const mongoose = require('mongoose')
const crypto = require('crypto')
const { Player, Lobby } = require('./models')

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true})

const socket = require('socket.io')(server, {
    path: '/socket.io'
})

socket.on('CreateRoom', (name) => {
    let player = new Player(
        {
            name: name,
            lifePoints: 100,
            userID: 1
        }
    ).save((err) => {
        if (err) socket.emit('ErrorLobby', 'Sorry, it wasn´t possible to create a lobby')
        else {
            socket.emit('InfoUser', player)
            let lobbyID = crypto.createHash('sha1').update(Date.now()).digest('hex')
            let lobby = new Lobby(
                {
                    players: 1,
                    id: lobbyID,
                    playersData: [player],
                    host: player
                }
            ).save((err) => {
                if (err) socket.emit('ErrorLobby', 'Sorry, it wasn´t possible to create a lobby')
                else {
                    socket.emit('InfoLobby', lobby)
                }
            })
        }
    })
})

server.listen(3000)
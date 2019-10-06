const server = require('http').createServer()
const mongoose = require('mongoose')
const { Player, Lobby } = require('./models')

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true})

const io = require('socket.io')(server, {
    path: '/socket.io'
})

io.on('connection', (socket) => {

    socket.on('CreateRoom', (data) => {
        console.log(data)
        let player = new Player(
            {
                name: data.nome,
                lifePoints: 100
            }
        ).save((err) => {
            if (err) socket.emit('ErrorLobby',  { 'error': 'Sorry, it wasn´t possible to create a lobby' })
            else {
                socket.emit('InfoUser', player)
                let lobby = new Lobby(
                    {
                        players: 1,
                        playersData: [player],
                        host: player
                    }
                ).save((err) => {
                    if (err) socket.emit('ErrorLobby',  { 'error': 'Sorry, it wasn´t possible to create a lobby' })
                    else {
                        socket.emit('InfoLobby', lobby)
                    }
                })
            }
        })
    })
    
    socket.on('JoinRoom', (data) => {
        query = Lobby.where({ _id: data.id }).findOne((err, lobby) => {
            if (err) socket.emit('ErrorLobby', { 'error': 'Sorry, it wasn´t possible to enter on lobby' })
            else {
                if (lobby.playersData.length >= 4) {
                    socket.emit('ErrorLobby',  { 'error': 'Sorry, but the lobby is full of players' })
                } else {
                    let player = new Player(
                        {
                            name: data.nome,
                            lifePoints: 100
                        }
                    ).save((err) => {
                        if (err) socket.emit('ErrorLobby',  { 'error': 'Sorry, it wasn´t possible to create a lobby' })
                        else {
                            lobby.playersData.push(player).save((err) => {
                                if (err) socket.emit('ErrorLobby',  { 'error': 'Sorry, it wasn´t possible to create a lobby' })
                                else {
                                    socket.emit('SuccessEnteringLobby', {})
                                }
                            })
                        }
                    })
                }
            }
        })
    })
})

server.listen(3000)
const server = require('http').createServer()
const mongoose = require('mongoose')
const { Player, Lobby, Action, Match } = require('./models')

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true})

const io = require('socket.io')(server, {
    path: '/socket.io'
})

io.on('connection', (socket) => {

    socket.on('CreateRoom', (data) => {
        Player.create(
            {
                name: data.nome
            }, (err, player) => {
                if (err) socket.emit('ErrorLobby',  { 'error': 'Sorry, it wasn´t possible to create a lobby' })
                else {
                    socket.emit('InfoUser', player)
                    Lobby.create(
                        {
                            playersData: [player],
                            host: player
                        }, (err, lobby) => {
                            if (err) socket.emit('ErrorLobby',  { 'error': 'Sorry, it wasn´t possible to create a lobby' })
                            else {
                                socket.join(`${lobby._id}`)
                                io.in(`${lobby._id}`).emit('InfoLobby', lobby)
                            }
                        }
                    )
                }
            }
        )
    })
    
    socket.on('JoinRoom', (data) => {
        Lobby.where({ _id: data._id }).findOne((err, lobby) => {
            if (err) socket.emit('ErrorLobby', { 'error': 'Sorry, it wasn´t possible to enter on lobby' })
            else {
                if (lobby.players >= 4) {
                    socket.emit('ErrorLobby',  { 'error': 'Sorry, but the lobby is full of players' })
                } else {
                    Player.create(
                        {
                            name: data.nome
                        }, (err, player) => {
                            socket.emit('InfoUser', player)
                            if (err) socket.emit('ErrorLobby',  { 'error': 'Sorry, it wasn´t possible to create a lobby' })
                            else {
                                lobby.players ++
                                lobby.playersData.push(player)
                                lobby.save((err) => {
                                    if (err) socket.emit('ErrorLobby',  { 'error': 'Sorry, it wasn´t possible to create a lobby' })
                                    else {
                                        socket.join(`${lobby._id}`)
                                        io.in(`${lobby._id}`).emit('InfoLobby', lobby)
                                    }
                                })
                            }
                        }
                    )
                }
            }
        })
    })

    socket.on('StartGame', (data) => {
        Lobby.where({ _id: data._id }).findOne((err, lobby) => {
            if (err) socket.emit('ErrorLobby', { 'error': 'Sorry, it wasn´t possible to start the game' })
            else if (lobby.players < 4) {
                socket.emit('ErrorLobby', { 'error': 'Sorry, theresn´t enough players to start the game' })
            } else {
                Match.create(
                    {
                        players: lobby.playersData,
                        room: `${lobby._id}`,
                        rounds: [{
                            round: 1,
                            turns: [{
                                turn: 0,
                                player: lobby.playersData[0]
                            }]
                        }]
                    }, (err, match) => {
                        if (err) socket.emit('ErrorStarting', { 'error': 'Error when you tried to start game!'})
                        else {
                            io.in(`${match.room}`).emit('MatchInfo', match)
                        }
                    }
                )
            }
        })
    })
})

server.listen(3000)
const server = require('http').createServer()
const mongoose = require('mongoose')
const crypto = require('crypto')
const { Player, Lobby, Action, Match, Item, RoundLog } = require('./models')

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
                            host: player,
                            room: crypto.createHash('md5').update(`${Date.now()}${socket.id}`).digest("hex").substr(0, 6).toUpperCase()
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
        Lobby.where({ room: data.room }).findOne((err, lobby) => {
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
                            Lobby.deleteOne({ _id: lobby._id }, (err) => {
                                if (err) console.log(err)
                            })
                        }
                    }
                )
            }
        })
    })

    socket.on('AdicionarItem', (data) => {
        let match = data.match
        Item.create({
            ...data.item
        }, (err, item) => {
            if (err) socket.emit('ErrorItem', { 'error': 'Wasn´t possible to push the card in your hand' })
            else {
                Player.updateOne({ _id: data.player._id },  { $push: { items: item }}, (err) => {
                    if (err) socket.emit('ErrorItem', { 'error': 'Wasn´t possible to push the card in your hand' })
                    else {
                        Match.findOne({ _id: match._id }, (err, match) => {
                            if(err) console.log(err)
                            else {
                                io.in(`${match.room}`).emit('MatchInfo', match)
                            }
                        })
                    }
                })
            }
        })
    })

    socket.on('UsarAcao', (data) => {
        Match.where({ _id: data.match._id }).findOne((err, match) => {
            if (err) console.log(err)
            else {
                match.rounds.sort('-round').findOne((err, round) => {
                    if (err) console.log(err)
                    else {
                        round.turns.sort('-turn').findOne((err, turn) => {
                            if (err) console.log(err)
                            else {
                                if (!turn.player._id === data.player._id) socket.emit('ErrorActing', { 'error': 'You are using an action in the wrong turn' })
                                else {
                                    Action.create({
                                        ...data.action
                                    }, (err, action) => {
                                        if (err) console.log(err)
                                        else {
                                            turn.actions.push(action)
                                            turn.save()
                                            console.log(turn)
                                            if (turn.actions.length == 2) {
                                                turn.turn += 1
                                                turn.save()
                                                // Pega os players vivos
                                                let players = match.players.filter(p => p.alive)
                                                // Comece a próxima rodada
                                                if (turn.turn >= players.length) {
                                                    // TODO: Funcão que manda o log
                                                    let actions = []
                                                }
                                            } else {
                                                socket.emit('InfoAction', turn.actions)
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        })
    })

})

server.listen(3000)
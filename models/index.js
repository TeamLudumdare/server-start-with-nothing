const mongoose = require('mongoose')

const Player = mongoose.model('Player', new mongoose.Schema({
    lifePoints: Number,
    name: String
}))

const Lobby = mongoose.model('Lobby', new mongoose.Schema({
    players: Number,
    playersData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }
}))

const Action = mongoose.model('Action', new mongoose.Schema({
    playerOrigin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    playerTarget: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    targetAll: Boolean,
    actionType: String
}))

const Match = mongoose.model('Match', new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    round: [{
        round: Number,
        turns: [{
            player: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Player'
            },
            actions: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Action'
            }]
        }]
    }]
}))

module.exports.Player = Player
module.exports.Lobby = Lobby
module.exports.Action = Action
module.exports.Match = Match
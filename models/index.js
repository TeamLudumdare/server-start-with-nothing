const mongoose = require('mongoose')

const Item = mongoose.model('Item', new mongoose.Schema({
    sprite: String,
    itemId: Number
}))

const Player = mongoose.model('Player', new mongoose.Schema({
    lifePoints: { type: Number, default: 100 },
    name: String,
    alive: { type: Boolean, default: true },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }]
}))

const Lobby = mongoose.model('Lobby', new mongoose.Schema({
    players: { type: Number, default: 1 },
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
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    actionType: String
}))

const Match = mongoose.model('Match', new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    room: String,
    rounds: [{
        round: Number,
        turns: [{
            turn: Number,
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

const RoundLog = mongoose.model('RoundLog', new mongoose.Schema({
    playersRead: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    actions: [{
        missed: Boolean,
        action: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Action'
        }
    }]
}))

module.exports.Item = Item
module.exports.Player = Player
module.exports.Lobby = Lobby
module.exports.Action = Action
module.exports.Match = Match
module.exports.RoundLog = RoundLog
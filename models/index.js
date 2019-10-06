const mongoose = require('mongoose')

const Player = mongoose.model('Player', new mongoose.Schema({
    lifePoints: Number,
    name: String
}));

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
}));

module.exports.Player = Player
module.exports.Lobby = Lobby
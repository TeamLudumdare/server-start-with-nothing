var mongoose = require('mongoose')

const player = new mongoose.Schema({
    userId: Number,
    lifePoints: Number,
    name: String
});

const lobby = new mongoose.Schema({
    players: Number,
    id: String,
    playersData: [player],
    host: player
});

function Player () {
    return player
}

function Lobby () {
    return lobby
}

module.exports.Player = Player

module.exports.Lobby = Lobby
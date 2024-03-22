const mongoose = require('mongoose');

var starfishSchema = new mongoose.Schema({
    moreOf: {
        type: String,
    },
    keepDoing:{
        type: String,
    },
    lessOf: {
        type: String,
    },
    stopDoing: {
        type: String,
    },
    startDoing: {
        type: String,
    }
});
const Starfish = mongoose.model('Starfish', starfishSchema);
module.exports = Starfish;
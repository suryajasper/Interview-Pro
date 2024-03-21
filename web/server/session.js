const mongoose = require('mongoose');
const Message = require('./message');
const Resume = require('./resume');
/*
sessionId: String,
resume: String,
jobDescription: String,
summary: String,
starfish: {
   ...
}
*/
var sessionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    message: {
        type: String,
    },
    summary: {
        type: String,
    },
    jobDescription: {
        type: String,
    },
    resume:{
        type: String,
    },
    starfish:{
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
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
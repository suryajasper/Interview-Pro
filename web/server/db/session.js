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
const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        unique: true,
        index: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    conversation: [
        {
            role: String,
            content: String,
        }
    ],
    summary: String,
    jobDescription: String,
    resumeContent: String,
    starfish:{
        moreOf: String,
        keepDoing: String,
        lessOf: String,
        stopDoing: String,
        startDoing: String
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
const mongoose = require('mongoose');

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
            quality: Number,
        }
    ],
    summary: String,
    jobDescription: String,
    resumeContent: String,
    starfishResults: {
        count: {
            type: Number,
            default: 0,
        },
        sum: [Number],
    },
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    sessionId: {
        type: ObjectId,
        default: "",
    },
    author: String,
    content: String,
});
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
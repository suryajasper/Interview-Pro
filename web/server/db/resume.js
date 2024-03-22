const mongoose = require('mongoose');

var resumeSchema = new mongoose.Schema({
    resumaData: String
});
const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
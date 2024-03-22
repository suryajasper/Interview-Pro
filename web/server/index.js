const express = require('express');
const gpt = require('./gpt');
const bodyParser = require('body-parser');
const Message = require('./db/message');
const Session = require('./db/session');
const { connectToMongo, closeMongoConnection } = require('./db/dbs');
const cors = require('cors');

const app = express();
const port = 6969;

app.use(bodyParser.json());
app.use(cors());

connectToMongo();

app.post('/createSession', async (req, res) => {
    try {
        console.log(`POST /createSession - Received request`);

        let { resumeContent, jobDescription } = req.body;
        const sessionId = await gpt.createSession();

        let sessionDoc = new Session({ sessionId, resumeContent, jobDescription });
        await sessionDoc.save();

        console.log(`POST /createSession - Successfully created session ${sessionId}`);

        res.json({ sessionId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/getResponse', async (req, res) => {
    const { sessionId, userMessage } = req.body;
    try {
        const response = await gpt.getResponse(sessionId, userMessage);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/getAnalysis/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const analysis = await gpt.getAnalysis(sessionId);
        res.json({ analysis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/getTranscript/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const transcript = await gpt.getTranscript(sessionId);
        res.send(transcript);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

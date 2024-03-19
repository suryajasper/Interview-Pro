const express = require('express');
const gpt = require('./gpt');
const bodyParser = require('body-parser');

const app = express();
const port = 6969;

app.use(bodyParser.json());

app.post('/createSession', async (req, res) => {
    try {
        const sessionId = await gpt.createSession();
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

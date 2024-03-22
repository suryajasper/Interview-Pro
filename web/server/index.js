const express = require('express');
const gpt = require('./gpt');
const bodyParser = require('body-parser');
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
        const { sessionId, startingPrompt } = await gpt.createSession(jobDescription, resumeContent);
        
        let sessionDoc = new Session({ 
            sessionId, 
            resumeContent, 
            jobDescription,
            conversation: [startingPrompt],
            starfishResults: {
                count: 0,
                sum: [0, 0, 0, 0, 0],
            }
        });
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
        console.log(`POST /getResponse - Received USER: "${userMessage}"`);

        const sessionDoc = await Session.findOne({ sessionId }).exec();
        const convHistory = sessionDoc.conversation.map(({ role, content }) => ({role, content}));
        console.log(`POST /getResponse - Loaded Conversation History: ${convHistory.length} messages`);
        
        const { starfish, gptResponse } = await gpt.getResponse(userMessage, convHistory);
        console.log(`POST /getResponse - Successfully produced GPT: ${gptResponse}`);

        const starfishHistory = sessionDoc.starfishResults;

        let count = starfishHistory.count;
        let sum = [0, 0, 0, 0, 0];
        let average = [...starfish.last];

        if (starfishHistory.count > 0 && starfishHistory.sum) {
            for (let i = 0; i < 5; i++) {
                sum[i] = starfish.last[i] + starfishHistory.sum[i];
                average[i] = sum[i] / (starfishHistory.count+1);
            }
        } else {
            sum = [...starfish.last];
        }
        count++;

        starfish.overall = average;

        console.log(`POST /getResponse - Successfully produced starfish:`, starfish);
        
        let convAddition = [
            { role: "user", content: userMessage, quality: average.reduce((a, b) => a + b) / 5 },
            { role: "system", content: gptResponse, quality: 0 },
        ];
        await Session.updateOne({ sessionId }, {
            $push: { conversation: { $each: convAddition } },
            starfishResults: {
                count, sum,
            },
        }).exec();
        console.log(`POST /getResponse - Successfully updated conversation in database`);
        
        res.json({ starfish, gptResponse });
    } catch (error) {
        console.error(`POST /getResponse - Error ${error}`)
        res.status(500).json({ error: error.message });
    }
});

app.get('/session', async (req, res) => {
    const { sessionId } = req.query;
    try {
        console.log(`GET /session - Received SessionId=${sessionId}`);
        const sessionDoc = await Session.findOne({ sessionId }).exec();
        console.log(`GET /session - Successfully retrieved session information`);

        res.json(sessionDoc);
    } catch (error) {
        console.error(`GET /session - Error ${error}`)
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

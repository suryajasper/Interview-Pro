const fs = require('fs');
const axios = require('axios');

const GPT_API_KEY_PATH = 'secret/gpt_key.txt';
const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';

const STARTING_PROMPT_PATH = 'secret/init.prompt';
const ANALYSIS_PROMPT_PATH = 'secret/analysis.prompt';

function getGPTAPIKey() {
    return fs.readFileSync(GPT_API_KEY_PATH, 'utf8').trim();
}

function getStartingPrompt() {
    return fs.readFileSync(STARTING_PROMPT_PATH, 'utf8').trim();
}

function getAnalysisPrompt() {
    return fs.readFileSync(ANALYSIS_PROMPT_PATH, 'utf8').trim();
}

const conversations = {};

async function createSession() {
    const response = await axios.post(GPT_API_URL, {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: getStartingPrompt(),
            }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getGPTAPIKey()}`
        }
    });

    let sessionId = response.data.id;

    conversations[sessionId] = [
        {
            role: "system",
            content: getStartingPrompt(),
        }
    ];

    return sessionId;
}

async function getResponse(sessionId, userMessage) {
    const response = await axios.post(GPT_API_URL, {
        model: "gpt-3.5-turbo",
        messages: [
            ...conversations[sessionId],
            {
                role: "user",
                content: userMessage,
            }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getGPTAPIKey()}`
        }
    });

    return response.data.choices[0].message.content;
}

async function getTranscript(sessionId) {
    return conversations[sessionId];
}

async function getAnalysis(sessionId) {
    const response = await axios.post(GPT_API_URL, {
        model: "gpt-3.5-turbo",
        messages: [
            ...conversations[sessionId],
            {
                role: "user",
                content: getAnalysisPrompt(),
            }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getGPTAPIKey()}`
        }
    });
    
    let analysisText = response.data.choices[0].message.content;
    let analysisObj = parseAnalysisText(analysisText);
    
    return analysisObj;
}

function parseAnalysisText(analysisText) {
    const analysisObject = {
        "Start Doing": "",
        "Try to Do More of": "",
        "Keep Doing": "",
        "Do Less of": "",
        "Stop Doing": ""
    };
    
    const sections = analysisText.split('\n\n');

    sections.forEach(section => {
        const lines = section.split('\n');
        if (lines.length > 1) {
            const category = lines[0].trim();
            const analysis = lines.slice(1).join('\n').trim();
            analysisObject[category] = analysis;
        }
    });

    return analysisObject;
}

module.exports = {
    createSession,
    getResponse,
    getTranscript,
    getAnalysis
};
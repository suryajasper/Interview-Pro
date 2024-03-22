const fs = require('fs');
const axios = require('axios');

const GPT_API_KEY_PATH = 'secret/gpt_key.txt';
const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';

const STARTING_PROMPT_PATH = 'secret/init.prompt';
const STARFISH_PROMPT_PATH = 'secret/starfish.prompt';
const ANALYSIS_PROMPT_PATH = 'secret/analysis.prompt';

function getGPTAPIKey() {
    return fs.readFileSync(GPT_API_KEY_PATH, 'utf8').trim();
}

function getStartingPrompt() {
    return fs.readFileSync(STARTING_PROMPT_PATH, 'utf8').trim();
}

function getStarfishPrompt() {
    return fs.readFileSync(STARFISH_PROMPT_PATH, 'utf8').trim();
}

function getAnalysisPrompt() {
    return fs.readFileSync(ANALYSIS_PROMPT_PATH, 'utf8').trim();
}

const conversations = {};

async function createSession(jobDescription, resumeContent) {
    let startContent = `${getStartingPrompt()}\n` + 
        `Here is the candidate's resume:\n${resumeContent} \n\n` + 
        `Here is the description of the job the candidate is interviewing for: ${jobDescription}`;

    const response = await axios.post(GPT_API_URL, {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: startContent,
            }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getGPTAPIKey()}`
        }
    });

    let sessionId = response.data.id;
    let startingPrompt = {
        role: "system",
        content: startContent,
    }

    return { sessionId, startingPrompt };
}

async function getStarfishEvaluation(convHistory) {
    try {
        let convString = convHistory.map(({role, content}) => `${role}: ${content}`).join('\n');
    
        const evaluation = await axios.post(GPT_API_URL, {
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: getStarfishPrompt() + '\n' + convString,
            }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getGPTAPIKey()}`
            }
        });
    
        let evaluationString = evaluation.data.choices[0].message.content;
        let overall = evaluationString.split('<conv_score>')[1].split('</conv_score>')[0].split(',').map(el => parseInt(el.trim()));
        let last = evaluationString.split('<last_score>')[1].split('</last_score>')[0].split(',').map(el => parseInt(el.trim()));

        return { overall, last };
    }
    catch (error) {
        console.error('error getting starfish evaluation: ', error.message);
    }
}

async function getResponse(userMessage, convHistory) {
    const response = await axios.post(GPT_API_URL, {
        model: "gpt-3.5-turbo",
        messages: [
            ...convHistory,
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

    const starfish = await getStarfishEvaluation(convHistory);
    const gptResponse = response.data.choices[0].message.content;

    return {
        gptResponse,
        starfish,
    };
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
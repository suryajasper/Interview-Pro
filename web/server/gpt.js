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

function stringifyHistory(convHistory) {
    return convHistory.map(({role, content}) => `${role}: ${content}`).join('\n');
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
        let convString = stringifyHistory(convHistory);
    
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
        ],
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getGPTAPIKey()}`
        }
    });

    const starfish = await getStarfishEvaluation([
        ...convHistory,
        {
            role: "user (last message)",
            content: userMessage,
        }
    ]);
    const gptResponse = response.data.choices[0].message.content;

    return {
        gptResponse,
        starfish,
    };
}

async function getTranscript(sessionId) {
    return conversations[sessionId];
}

async function getAnalysis(convHistory) {
    const response = await axios.post(GPT_API_URL, {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: getAnalysisPrompt() + '\n' + stringifyHistory(convHistory),
            },
        ],
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getGPTAPIKey()}`
        }
    });
    
    const analysisText = response.data.choices[0].message.content;
    return analysisText;
}

module.exports = {
    createSession,
    getResponse,
    getTranscript,
    getAnalysis
};
const { createSession,
    getResponse,
    getTranscript,
    getAnalysis 
} = require('./gpt');

const readline = require('readline/promises');

async function gpt() {
    console.log('Initializing Input')
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
      

    console.log('Creating GPT session');
    let sessionId = await createSession();
    console.log(`Created session "${sessionId}"`);

    let firstResponse = await getResponse(sessionId, "Hello. Please begin the interview.");
    console.log(`Davey: ${firstResponse}`);
    
    for (let i = 0; i < 3; i++) {
        let userInput = await rl.question('User: ');
        let gptResponse = await getResponse(sessionId, userInput);
        console.log(`Davey: ${gptResponse}`);
    }

    let analysis = await getAnalysis(sessionId);
    console.log(`Analysis:\n${analysis}`);
}

gpt();
export interface Session {
    sessionId: string,
    date: Date,
    conversation: [{
        role: string,
        content: string,
    }],
    summary: string,
    jobDescription: string,
    resumeContent: string,
    starfish:{
        moreOf: string,
        keepDoing: string,
        lessOf: string,
        stopDoing: string,
        startDoing: string
    }
};


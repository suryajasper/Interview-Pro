export interface Session {
    sessionId: string,
    date: Date,
    conversation: [{
        role: string,
        content: string,
        quality: number,
    }],
    summary: string,
    jobDescription: string,
    resumeContent: string,
    starfishResults: {
        count: number,
        sum: number[],
    }
};


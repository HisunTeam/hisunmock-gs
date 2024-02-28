export enum generateContentResultStatus {
    success = 'success',
    error = 'error'
}

export interface generateContentResult {
    status: generateContentResultStatus;
    text: string;
}

export enum modelProviders {
    OpenAI = 'OpenAI',
    Gemini = 'Gemini'
}
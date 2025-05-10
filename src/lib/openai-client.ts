import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export const initOpenaiClient = (apiKey: string) => {
  openaiClient = new OpenAI({
    apiKey,
  });
};

export const getOpenaiClient = () => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized');
  }
  return openaiClient;
};

import OpenAI from 'openai';
import logger from './logger.js';

let openaiClient: OpenAI | null = null;

export const initOpenaiClient = (apiKey: string) => {
  openaiClient = new OpenAI({
    apiKey,
  });
  logger.info('[OpenAI CLIENT]:  initialized successfully');
};

export const getOpenaiClient = () => {
  if (!openaiClient) {
    throw new Error('[OpenAI CLIENT]: not initialized');
  }
  return openaiClient;
};

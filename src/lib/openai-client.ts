import OpenAI from 'openai';
import { config } from '../../envconfig.js';
import logger from './logger.js';

const apiKey = config.openai.apiKey;

let openaiClient: OpenAI | null = null;

export const getOpenaiClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
    });
    logger.info('[OpenAI API]: client initialized');
  }

  return openaiClient;
};

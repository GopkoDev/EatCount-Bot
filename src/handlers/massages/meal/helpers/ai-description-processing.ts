import logger from '../../../../lib/logger.js';
import { getOpenaiClient } from '../../../../lib/openai-client.js';

const models = [
  {
    name: 'gpt-4o-mini',
    price: { input: 1.1, output: 4.4, cachedInput: 0.275 },
  },
  { name: 'gpt-3.5-turbo', price: { input: 0.5, output: 1.5 } },
  { name: 'gpt-4o', price: { input: 5.0, output: 15.0 } },
];

// Example structure of the response
`{
  items: [
    [
      'name of the dish in the original language',
      100, // weight in grams
      'search phrase in the database in English',
      ['additional search terms'],
      ['terms for exclusion'],
    ],
  ],
};`;

type FoodItem = [string, number, string, string[], string[]];

type ApiResponse = {
  items: FoodItem[];
};

export type ProcessingResult = {
  name: string;
  weight: number;
  query: string;
  additionalTerms: string[];
  excludeTerms: string[];
};

interface ProcessingProps {
  query: string;
}

interface ProcessingAiDescriptionResult {
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
  };
  processedFoods: ProcessingResult[];
}

const prompt =
  'You are an assistant that analyzes food descriptions and creates structured data for nutritional analysis. Format your response as a JSON object with the following structure: { "items": [ [ "назва страви мовою оригіналу", вага в грамах, "запит для пошуку в базі даних fat secret", ["додаткові пошукові терміни"], ["терміни для виключення"] ] ] }. IMPORTANT: 1) Never duplicate components - if the same product appears multiple times, combine them into one entry with the correct total weight; 2) Pay close attention to quantities mentioned; 3) For single ingredients not part of a meal, include them as individual items; 4) Use standard portion weights if specific amounts are not given (e.g., 1 egg ≈ 50g); 5) When uncertain about an ingredient, prefer to include it with estimated weight rather than omit it. The query field should be optimized for USDA FoodData Central database searches (https://fdc.nal.usda.gov/) specifically for Survey (FNDDS) database type (dataType=Survey%20(FNDDS)). Use common food names in English that would match FNDDS entries, avoid brand names, and prefer generic terms. VERY IMPORTANT: Always provide exactly 2 values for additional search terms that help find the purest form of the ingredient. Always provide exactly 2 values for exclude terms to avoid processed or mixed versions of the ingredient.';

const openai = getOpenaiClient();

const currentModelIndex = 0;

export const processAiDescription = async ({
  query,
}: ProcessingProps): Promise<ProcessingAiDescriptionResult> => {
  const currentModel = models[currentModelIndex];

  try {
    const response = await openai.chat.completions.create({
      model: currentModel.name,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const usage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      model: response.model || currentModel.name,
    };

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response content');
    }

    const parsedResponse = JSON.parse(content) as ApiResponse;
    const result = parsedResponse.items.map((item) =>
      parseResponse(item)
    ) as ProcessingResult[];

    return { usage, processedFoods: result };
  } catch (error) {
    const text = `[AI Description Processing]: Failed to process query "${query}": ${error}`;
    logger.error(text);
    throw new Error(text);
  }
};

function parseResponse(item: FoodItem): ProcessingResult {
  return {
    name: item[0],
    weight: item[1],
    query: item[2],
    additionalTerms: item[3],
    excludeTerms: item[4],
  };
}

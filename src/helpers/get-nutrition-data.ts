import { getOpenaiClient } from '../lib/openai-client.js';
import logger from '../../src/lib/logger.js';

export interface NutritionData {
  totalCalories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  saturatedFat: number;
  polyunsaturatedFat: number;
  monounsaturatedFat: number;
  cholesterol: number;
  vitamins: Record<string, number>;
  ingredients: string[];
}

export async function getNutritionData(
  userMessage: string
): Promise<NutritionData | null> {
  try {
    const openai = getOpenaiClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Ти помічник для аналізу харчової цінності.
            Проаналізуй наведену їжу/продукти і надай точну інформацію про їхню харчову цінність.
            Відповідай лише в форматі JSON з такими полями:
            {
              "totalCalories": число (загальна калорійність ккал),
              "protein": число (білки в грамах),
              "fat": число (жири в грамах),
              "carbs": число (вуглеводи в грамах),
              "fiber": число (клітковина в грамах),
              "sugar": число (цукор в грамах),
              "saturatedFat": число (насичені жири в грамах),
              "polyunsaturatedFat": число (поліненасичені жири в грамах),
              "monounsaturatedFat": число (мононенасичені жири в грамах),
              "cholesterol": число (холестерин в міліграмах),
              "ingredients": ["інгредієнт1", "інгредієнт2", ...]
            }
            Використовуй тільки числові значення без одиниць виміру в JSON.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      logger.error('OpenAI API returned empty content');
      return null;
    }

    return JSON.parse(content) as NutritionData;
  } catch (error) {
    logger.error('Error getting nutrition data from OpenAI:', error);
    return null;
  }
}

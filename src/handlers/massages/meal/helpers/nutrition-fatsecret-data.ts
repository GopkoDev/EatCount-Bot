import type { ProcessingResult } from './ai-description-processing.js';
import {
  getFatSecretClient,
  type FoodDetails,
  type FoodDetailsResponse,
  type FoodSearchResponse,
  type FoodSearchResult,
  type Serving,
} from '../../../../lib/fatsecret-client.js';
import logger from '../../../../lib/logger.js';

const fatSecret = await getFatSecretClient();

export interface ApiFaildFood {
  food: ProcessingResult;
  error?: string;
}

const findBestMatch = (
  foodArr: ProcessingResult,
  listFromApi: FoodSearchResponse
): FoodSearchResult => {
  const { additionalTerms, excludeTerms } = foodArr;

  const scoredFoods = listFromApi.foods.food.map((food: FoodSearchResult) => {
    const foodName = food.food_name.toLowerCase();
    let score = 10;

    additionalTerms.forEach((term) => {
      if (foodName.includes(term.toLowerCase())) {
        score += 2;
      }
    });

    excludeTerms.forEach((term) => {
      if (foodName.includes(term.toLowerCase())) {
        score -= 3;
      }
    });

    if (food.food_type === 'Generic') {
      score += 3;
    }

    return { ...food, score };
  });

  const sortedFoods = scoredFoods.sort((a, b) => b.score - a.score);

  return sortedFoods[0];
};

const searchFoodItem = async (foodArr: ProcessingResult): Promise<string> => {
  const response = await fatSecret.searchFood(foodArr.query);

  if (Number(response.foods.total_results) === 0 || !response.foods.food) {
    logger.warn(`No results found for "${foodArr.query}"`);
    throw new Error(`No results found for "${foodArr.query}"`);
  }

  const bestMatch = findBestMatch(foodArr, response);
  return bestMatch.food_id;
};

const getFoodById = async (foodId: string): Promise<FoodDetailsResponse> => {
  const result = await fatSecret.getFoodById(foodId);

  if (!result.food || !result.food) {
    throw new Error(`Food item with ID "${foodId}" does not exist`);
  }

  return result;
};

const filterFoodServings = (foodObj: FoodDetailsResponse): FoodDetails => {
  if (
    !foodObj.food ||
    !foodObj.food.servings ||
    !foodObj.food.servings.serving
  ) {
    logger.warn(
      'Food item does not have servings:',
      foodObj.food?.food_name || 'Unknown food'
    );
    throw new Error(
      `filterFoodServings: Food item does not have servings: ${
        foodObj.food?.food_name || 'Unknown food'
      }`
    );
  }

  const filteredServings = foodObj.food.servings.serving.filter(
    (serving: Serving) =>
      serving.number_of_units === '100.000' &&
      serving.measurement_description === 'g'
  );

  if (filteredServings.length === 0) {
    logger.warn(
      `No servings found for food "${foodObj.food.food_name}" with 100g measurement`
    );
    throw new Error(
      `filterFoodServings: No servings found for food "${foodObj.food.food_name}" with 100g measurement`
    );
  }

  return {
    ...foodObj.food,
    servings: {
      serving: filteredServings,
    },
  };
};

export const nutritionFatsecret = async (
  processedFoods: ProcessingResult[]
): Promise<{
  validFoods: FoodDetails[];
  failedFoods: ApiFaildFood[];
}> => {
  try {
    const idsResults = await Promise.all(
      processedFoods.map(async (food) => {
        try {
          const id = await searchFoodItem(food);
          return { valid: true, food, id };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Error searching food item "${food.query}":`, error);
          return {
            valid: false,
            food,
            error: `Error searching food item "${food.query}": ${errorMessage}`,
          };
        }
      })
    );

    const failedFoods: ApiFaildFood[] = idsResults
      .filter((result) => !result.valid)
      .map((result) => ({ food: result.food, error: result.error! }));

    const foodDetailsResults = await Promise.all(
      idsResults
        .filter((result) => result.valid)
        .map(async (result) => {
          try {
            const foodDetails = await getFoodById(result.id!);
            const filteredServings = filterFoodServings(foodDetails);
            return { valid: true, foodDetails: filteredServings };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            logger.error(
              `Error fetching food details for ID "${result.id}":`,
              error
            );
            return {
              valid: false,
              food: result.food,
              error: `Error fetching food details for ID "${result.id}": ${errorMessage}`,
            };
          }
        })
    );

    const validFoods: FoodDetails[] = foodDetailsResults
      .filter((result) => result.valid)
      .flatMap((result) => result.foodDetails!);

    const additionalFailedFoods: ApiFaildFood[] = foodDetailsResults
      .filter((result) => !result.valid)
      .map((result) => ({ food: result.food!, error: result.error! }));

    return {
      validFoods,
      failedFoods: [...failedFoods, ...additionalFailedFoods],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Critical error in nutritionFatsecret:', error);
    return {
      validFoods: [],
      failedFoods: processedFoods.map((food) => ({
        food,
        error: `Critical error in nutritionFatsecret: ${errorMessage}`,
      })),
    };
  }
};

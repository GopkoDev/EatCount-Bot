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

const searchFoodItem = async (
  foodArr: ProcessingResult
): Promise<string | null> => {
  const response = await fatSecret.searchFood(foodArr.query);

  if (response.foods.total_results === 0) {
    logger.warn(`No results found for "${foodArr.query}"`);
    return null;
  }

  const bestMatch = findBestMatch(foodArr, response);
  return bestMatch.food_id;
};

const getFoodById = async (foodId: string): Promise<FoodDetailsResponse> => {
  return await fatSecret.getFoodById(foodId);
};

const filterFoodServings = (foodArr: FoodDetailsResponse[]): FoodDetails[] => {
  if (!Array.isArray(foodArr)) {
    logger.warn('Expected an array of food items, received:', foodArr);
    return [];
  }

  return foodArr
    .map((foodObj: FoodDetailsResponse) => {
      if (
        !foodObj.food ||
        !foodObj.food.servings ||
        !foodObj.food.servings.serving
      ) {
        logger.warn(
          'Food item does not have servings:',
          foodObj.food?.food_name || 'Unknown food'
        );
        return null;
      }

      const filteredServings = foodObj.food.servings.serving.filter(
        (serving: Serving) =>
          serving.number_of_units === '100.000' &&
          serving.measurement_description === 'g'
      );

      return {
        ...foodObj.food,
        servings: {
          serving: filteredServings,
        },
      };
    })
    .filter((item: any): item is FoodDetails => item !== null);
};

export const nutritionFatsecret = async (
  processedFoods: ProcessingResult[]
): Promise<{
  validFoods: FoodDetails[];
  failedFoods: ApiFaildFood[];
}> => {
  try {
    const failedFoods: { food: ProcessingResult; error?: string }[] = [];

    const idsList = await Promise.all(
      processedFoods.map(async (food) => {
        try {
          const id = await searchFoodItem(food);
          if (!id) {
            failedFoods.push({ food });
          }
          return id;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Error searching food item "${food.query}":`, error);
          failedFoods.push({ food, error: errorMessage });
          return null;
        }
      })
    );

    const foodDetails = await Promise.all(
      idsList.map(async (id, index) => {
        if (id) {
          try {
            return await getFoodById(id);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Error fetching food details for ID "${id}":`, error);
            failedFoods.push({
              food: processedFoods[index],
              error: errorMessage,
            });
            return null;
          }
        }
        return null;
      })
    );

    const validFoodDetails = foodDetails.filter(
      (item): item is FoodDetailsResponse => item !== null
    );
    const validFoods = filterFoodServings(validFoodDetails);

    return { validFoods, failedFoods };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in nutritionFatsecret:', error);
    return {
      validFoods: [],
      failedFoods: processedFoods.map((food) => ({
        food,
        error: errorMessage,
      })),
    };
  }
};

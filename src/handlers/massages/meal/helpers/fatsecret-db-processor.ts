import type { Meal, MealItem, MealType } from '@prisma/client';
import type { ValidFoodsData } from './nutrition-fatsecret-data.js';

const keysToExclude = [
  'measurement_description',
  'number_of_units',
  'metric_serving_unit',
  'metric_serving_amount',
  'serving_url',
  'serving_description',
  'serving_id',
];

export interface preparedForDb {
  meal: Meal;
  items: MealItem[];
}

export const fatSecretDbProcessor = (
  validFoods: ValidFoodsData[],
  mealType: MealType
): preparedForDb[] => {
  return validFoods.map(({ foodDetails, processedFood }) => {
    const userPortionGrams = processedFood.weight;

    if (!userPortionGrams || !foodDetails.servings?.serving?.[0]) {
      throw new Error(
        `[fatSecretDbProcessor]: Invalid data for food: ${foodDetails.food_name}`
      );
    }

    const serving = foodDetails.servings.serving[0];
    const calculatedValues: Record<string, number> = {};

    for (const [key, value] of Object.entries(serving)) {
      if (!keysToExclude.includes(key)) {
        calculatedValues[key] = (Number(value) * userPortionGrams) / 100;
      }
    }

    const mealItems = [
      {
        name: foodDetails.food_name,
        amountGrams: userPortionGrams,
        calories: calculatedValues.calories || 0,
        protein: calculatedValues.protein || 0,
        fat: calculatedValues.fat || 0,
        carbs: calculatedValues.carbohydrate || 0,
        saturatedFat: calculatedValues.saturated_fat || 0,
        polyunsaturatedFat: calculatedValues.polyunsaturated_fat || 0,
        monounsaturatedFat: calculatedValues.monounsaturated_fat || 0,
        cholesterol: calculatedValues.cholesterol || 0,
        sodium: calculatedValues.sodium || 0,
        potassium: calculatedValues.potassium || 0,
        fiber: calculatedValues.fiber || 0,
        sugar: calculatedValues.sugar || 0,
        vitaminA: calculatedValues.vitamin_a || 0,
        vitaminC: calculatedValues.vitamin_c || 0,
        calcium: calculatedValues.calcium || 0,
        iron: calculatedValues.iron || 0,
        transFat: calculatedValues.trans_fat || null,
        addedSugars: calculatedValues.added_sugars || null,
        vitaminD: calculatedValues.vitamin_d || null,
      },
    ];

    const totalCalories = mealItems.reduce(
      (sum, item) => sum + item.calories,
      0
    );
    const totalProtein = mealItems.reduce((sum, item) => sum + item.protein, 0);
    const totalFat = mealItems.reduce((sum, item) => sum + item.fat, 0);
    const totalCarbs = mealItems.reduce((sum, item) => sum + item.carbs, 0);

    return {
      meal: {
        type: mealType,
        description: processedFood.name,
        totalCalories,
        totalProtein,
        totalFat,
        totalCarbs,
      } as Meal,
      items: mealItems as MealItem[],
    };
  });
};

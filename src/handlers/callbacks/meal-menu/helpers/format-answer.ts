import type { ApiFaildFood } from './nutrition-fatsecret-data.js';
import type { preparedForDb } from './fatsecret-db-processor.js';

export const formatAnswer = (
  preparedForDb: preparedForDb[],
  failedFoods: ApiFaildFood[]
) => {
  const failed = failedFoods || [];

  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let itemsText = '';

  preparedForDb.forEach(({ meal, items }) => {
    totalCalories += meal.totalCalories;
    totalProtein += meal.totalProtein;
    totalFat += meal.totalFat;
    totalCarbs += meal.totalCarbs;

    if (items.length > 0) {
      items.forEach((item) => {
        itemsText += `- ${meal.description} (${item.amountGrams.toFixed(
          1
        )}г): ${item.calories.toFixed(1)} ккал\n`;
      });
    }
  });

  totalCalories = parseFloat(totalCalories.toFixed(1));
  totalProtein = parseFloat(totalProtein.toFixed(1));
  totalFat = parseFloat(totalFat.toFixed(1));
  totalCarbs = parseFloat(totalCarbs.toFixed(1));

  const notice =
    '_Примітка: Це наближена оцінка харчової цінності, яка може відрізнятися від фактичних значень._';

  let failedItemsText = '';
  if (failed.length > 0) {
    failedItemsText = `\n\n⚠️ Не вдалося отримати дані для наступних продуктів:
${failed
  .map((item) => `- ${item.food.name} (${item.food.weight} г)`)
  .join('\n')}`;
  }

  let macroDetails = `Калорії: ${totalCalories} ккал\nБілки: ${totalProtein} г\nЖири: ${totalFat} г\nВуглеводи: ${totalCarbs} г`;

  let mealTypeText = '';
  let mealEmoji = '';

  if (preparedForDb.length > 0) {
    const mealType = preparedForDb[0].meal.type;
    switch (mealType) {
      case 'BREAKFAST':
        mealTypeText = 'сніданок';
        mealEmoji = '🍳';
        break;
      case 'LUNCH':
        mealTypeText = 'обід';
        mealEmoji = '🍝';
        break;
      case 'DINNER':
        mealTypeText = 'вечеря';
        mealEmoji = '🍽️ ';
        break;
      case 'SNACK':
        mealTypeText = 'перекус';
        mealEmoji = '🍌';
        break;
    }
  }

  return `${mealEmoji} Прийом їжі: ${mealTypeText}

✅ Ми розпізнали:
${itemsText}${failedItemsText}

📊 Підсумок:
${macroDetails}

${notice}`;
};

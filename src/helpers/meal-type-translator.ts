import type { MealType } from '@prisma/client';

export function translateMealTypeToUkrainian(mealType: MealType): string {
  const translations: Record<MealType, string> = {
    BREAKFAST: 'Сніданок',
    LUNCH: 'Обід',
    DINNER: 'Вечеря',
    SNACK: 'Перекус',
  };

  return translations[mealType] || 'Інше';
}

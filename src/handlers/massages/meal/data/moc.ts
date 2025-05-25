export const mocFoods = [
  {
    name: 'яблуко',
    weight: 150,
    query: 'яблуко',
    additionalTerms: [],
    excludeTerms: [],
  },
  {
    name: 'грецький салат',
    weight: 200,
    query: 'greek salad',
    additionalTerms: ['feta cheese', 'cucumber'],
    excludeTerms: ['dressing', 'olives'],
  },
  {
    name: 'томатний сік',
    weight: 240,
    query: 'tomato juice',
    additionalTerms: ['pure tomato juice', 'fresh tomato juice'],
    excludeTerms: ['canned', 'with added salt'],
  },
  {
    name: 'сир',
    weight: 100,
    query: 'cheese',
    additionalTerms: ['feta cheese', 'goat cheese'],
    excludeTerms: ['processed cheese', 'cheese spread'],
  },
  {
    name: 'хліб',
    weight: 50,
    query: 'bread',
    additionalTerms: ['whole grain bread', 'rye bread'],
    excludeTerms: ['white bread', 'toasted bread'],
  },
  {
    name: 'куряче філе',
    weight: 150,
    query: 'chicken breast',
    additionalTerms: ['grilled chicken', 'roasted chicken'],
    excludeTerms: ['fried chicken', 'breaded chicken'],
  },
];

export const mocUsage = {
  model: 'gpt-3.5-turbo',
  promptTokens: 100,
  completionTokens: 200,
  totalTokens: 300,
  queryText: 'Mock AI query for meal description',
};

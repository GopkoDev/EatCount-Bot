import { Bot } from 'grammy';
import type { MyContext } from '../../types.js';

import { mainMenuCallbacks } from './main-menu/index.js';
import { mealMenuCallbacks } from './meal-menu/index.js';

export const registerKeyboardsCallbacks = (bot: Bot<MyContext>) => {
  mainMenuCallbacks(bot);
  mealMenuCallbacks(bot);
};

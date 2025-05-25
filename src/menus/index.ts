import { Bot } from 'grammy';
import type { MyContext } from '../types.js';

import { mainMenuCallbacks } from './main-menu.js';
import { mealMenuCallbacks } from './meal-menus.js';

export const registerKeyboardsCallbacks = (bot: Bot<MyContext>) => {
  mainMenuCallbacks(bot);
  mealMenuCallbacks(bot);
};

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Встановлення typescript глобально для компіляції
RUN npm ci 

COPY . .

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV production

# Запуск збілдженої версії
CMD ["node", "dist/bot.js"] 
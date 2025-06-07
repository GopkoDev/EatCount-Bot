# 🍽️ EatCount Telegram Bot

An intelligent Telegram bot for nutrition and calorie tracking using artificial intelligence and FatSecret database.

## 📋 Core Features

### 🍴 Adding Meals

- **Automatic Analysis**: Describe your meal in natural language, and the bot will automatically recognize ingredients
- **Meal Type Support**: Breakfast, lunch, dinner, snacks
- **Accurate Calculation**: Calories, proteins, fats, carbohydrates, and micronutrients
- **FatSecret Database**: Using a large food database for accurate data

### 📊 Nutrition Statistics

- **Daily Statistics**: Detailed nutrient analysis for today
- **Weekly Statistics**: Nutrition overview for current and previous week
- **Goal Progress**: Visual indicator of daily calorie goal achievement
- **Macronutrient Analysis**: Calorie distribution by proteins, fats, and carbohydrates

### 🔄 Record Editing

- **Today's Meals**: Quick access to today's meals
- **Recent Records**: View and edit the last 100 meals
- **Type Change**: Ability to change meal type
- **Description Editing**: Update meal description
- **Record Deletion**: Safe meal deletion with confirmation

### ⚙️ Settings

- **Calorie Goals**: Setting and tracking daily calorie goals
- **Progress Bar**: Visual representation of goal progress
- **Flexible Settings**: Ability to change or delete goals

## 🤖 Artificial Intelligence

The bot uses OpenAI for:

- **Product Recognition**: Natural food description analysis
- **Quantity Determination**: Automatic portion weight determination
- **Data Structuring**: Converting descriptions into structured data for search

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18+)
- PostgreSQL database
- Telegram Bot Token
- OpenAI API key
- FatSecret API keys

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd EatCount-Bot
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**
   Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual values.

**Note:** You can find all required environment variables in the `.env.example` file.

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Database migration
npx prisma migrate dev --name init
```

5. **Run the bot**

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📝 Bot Commands

| Command  | Description                       |
| -------- | --------------------------------- |
| `/start` | Initial greeting and registration |
| `/meal`  | Quick meal addition               |

## 🎯 Interactive Menu

### Main Menu:

- 🍴 **Add Meal** - Choose type and describe food
- 📊 **Statistics** - View daily/weekly statistics
- 🔄 **Edit** - Manage meal records
- ⚙️ **Settings** - Set calorie goals
- 🚀 **Advanced Statistics on Website** - Go to web app

## 📈 Usage Example

1. **Adding a meal:**

   - Press "🍴 Add Meal"
   - Choose type (breakfast/lunch/dinner/snack)
   - Describe what you ate: "2 eggs, toast with butter, orange juice"
   - Get detailed analysis of calories and nutrients

2. **Viewing statistics:**

   - Press "📊 Statistics"
   - Choose period (today/this week/last week)
   - View detailed statistics with goal progress

3. **Editing records:**
   - Press "🔄 Edit"
   - Choose today's or recent meals
   - Change description, type, or delete record

## 🏗️ Project Architecture

```
EatCount-Bot/
├── src/
│   ├── handlers/
│   │   ├── commands/         # Bot command handlers
│   │   ├── callbacks/        # Inline button handlers
│   │   └── messages/         # Text message handlers
│   ├── menus/               # UI menus and keyboards
│   ├── lib/                 # Core services (DB, OpenAI, FatSecret, Logger)
│   ├── helpers/             # Helper functions
│   └── middlewares/         # Session middleware
├── prisma/                  # Database schema and migrations
└── logs/                   # Application log files
```

## 🔧 Technologies

- **Grammy**: Modern framework for Telegram bots
- **Prisma**: ORM for database operations
- **OpenAI**: Artificial intelligence for text processing
- **FatSecret API**: Food database
- **Winston**: Logging system
- **TypeScript**: Typed development
- **PostgreSQL**: Relational database

## 📊 Logging and Monitoring

The bot maintains detailed logging:

- **Errors**: Detailed error information
- **Statistics**: Feature usage analysis

## 🐳 Docker

The project supports containerization via Docker:

```bash
# Build image
docker build -t eatcount-bot .

# Run container
docker run -d --env-file .env eatcount-bot
```

## 👨‍💻 Development

### npm Command Structure:

- `npm run dev` - Development mode with hot reload
- `npm run build` - TypeScript project build
- `npm start` - Run production version

## 👤 Author

Dmytro Hopko

---

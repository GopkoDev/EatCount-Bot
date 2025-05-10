-- CreateTable
CREATE TABLE "nutrition_data" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "totalCalories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL,
    "sugar" DOUBLE PRECISION NOT NULL,
    "saturatedFat" DOUBLE PRECISION NOT NULL,
    "polyunsaturatedFat" DOUBLE PRECISION NOT NULL,
    "monounsaturatedFat" DOUBLE PRECISION NOT NULL,
    "cholesterol" DOUBLE PRECISION NOT NULL,
    "vitamins" JSONB NOT NULL DEFAULT '{}',
    "ingredients" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_data_mealId_key" ON "nutrition_data"("mealId");

-- AddForeignKey
ALTER TABLE "nutrition_data" ADD CONSTRAINT "nutrition_data_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

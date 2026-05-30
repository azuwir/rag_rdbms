-- CreateTable
CREATE TABLE "production" (
    "id" SERIAL NOT NULL,
    "plant" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "production_target" DECIMAL(18,2) NOT NULL,
    "production_actual" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue" (
    "id" SERIAL NOT NULL,
    "plant" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "revenue_target" DECIMAL(18,2) NOT NULL,
    "revenue_actual" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lop" (
    "id" SERIAL NOT NULL,
    "plant" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "lop_hour" DECIMAL(18,2) NOT NULL,
    "lop_production" DECIMAL(18,2) NOT NULL,
    "lop_revenue" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "lop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "production_plant_year_month_idx" ON "production"("plant", "year", "month");

-- CreateIndex
CREATE INDEX "revenue_plant_year_month_idx" ON "revenue"("plant", "year", "month");

-- CreateIndex
CREATE INDEX "lop_plant_year_month_idx" ON "lop"("plant", "year", "month");

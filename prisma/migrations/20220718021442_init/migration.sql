-- CreateTable
CREATE TABLE "miner_data" (
    "model" TEXT NOT NULL,
    "th" DOUBLE PRECISION NOT NULL,
    "watts" DOUBLE PRECISION NOT NULL,
    "efficiency" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "miner_data_pkey" PRIMARY KEY ("model")
);

-- CreateTable
CREATE TABLE "market_data" (
    "id" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,
    "model" TEXT,

    CONSTRAINT "market_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "miner_data_model_key" ON "miner_data"("model");

-- CreateIndex
CREATE UNIQUE INDEX "market_data_id_key" ON "market_data"("id");

-- AddForeignKey
ALTER TABLE "market_data" ADD CONSTRAINT "market_data_model_fkey" FOREIGN KEY ("model") REFERENCES "miner_data"("model") ON DELETE SET NULL ON UPDATE CASCADE;

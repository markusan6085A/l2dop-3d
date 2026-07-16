-- CreateTable
CREATE TABLE "MarketListing" (
    "id" TEXT NOT NULL,
    "sellerCharacterId" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "enchant" INTEGER NOT NULL DEFAULT 0,
    "priceAdena" BIGINT NOT NULL DEFAULT 0,
    "priceCoinOfLuck" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketListing_createdAt_idx" ON "MarketListing"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "MarketListing_sellerCharacterId_idx" ON "MarketListing"("sellerCharacterId");

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_sellerCharacterId_fkey" FOREIGN KEY ("sellerCharacterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Baseline schema (User + Character) for L2DOP; узгоджено з server/prisma/schema.prisma

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "hp" INTEGER NOT NULL DEFAULT 100,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "cityId" TEXT NOT NULL DEFAULT 'l2dop_gludio',
    "race" TEXT NOT NULL DEFAULT 'Human',
    "classBranch" TEXT NOT NULL DEFAULT 'fighter',
    "adena" BIGINT NOT NULL DEFAULT 0,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

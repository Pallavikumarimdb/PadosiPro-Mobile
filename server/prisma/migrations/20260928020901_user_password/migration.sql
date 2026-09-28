-- Add bcrypt password hash for email+password registration (nullable: pre-existing dev rows)
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Migration: Add skippedAnomalies field to SiteSettings
-- Run this SQL directly on your database if prisma db push doesn't work

-- Add the skippedAnomalies column to SiteSettings table
ALTER TABLE "SiteSettings" 
ADD COLUMN IF NOT EXISTS "skippedAnomalies" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- If the SiteSettings row doesn't exist, create it
INSERT INTO "SiteSettings" (id, "skippedAnomalies")
VALUES ('settings', ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;


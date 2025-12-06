-- AlterTable
ALTER TABLE "folders" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER;

-- Drop icon column if exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'icon'
    ) THEN
        ALTER TABLE "folders" DROP COLUMN "icon";
    END IF;
END $$;

-- Safely drop note_tags table if exists
DROP TABLE IF EXISTS "public"."note_tags";
DROP TABLE IF EXISTS "note_tags";

-- Safely drop tags table if exists
DROP TABLE IF EXISTS "public"."tags";
DROP TABLE IF EXISTS "tags";

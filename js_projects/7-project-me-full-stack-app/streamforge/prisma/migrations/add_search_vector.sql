-- Run this after your initial prisma migrate dev
-- File: prisma/migrations/add_search_vector.sql

UPDATE "videos"
SET "searchVector" = to_tsvector(
  'english',
  coalesce(title, '') || ' ' || coalesce(description, '')
);

CREATE INDEX IF NOT EXISTS videos_search_vector_idx
  ON "videos" USING GIN ("searchVector");

CREATE OR REPLACE FUNCTION videos_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" := to_tsvector(
    'english',
    coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS videos_search_vector_trigger ON "videos";
CREATE TRIGGER videos_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description
  ON "videos"
  FOR EACH ROW
  EXECUTE FUNCTION videos_search_vector_update();

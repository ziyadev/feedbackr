-- Normalize existing emails (matches normalizeString in the app).
UPDATE "User" SET "email" = lower(btrim("email"));

-- Fail loudly if duplicate emails remain after normalization.
DO $$
DECLARE
  dup_count integer;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT "email"
    FROM "User"
    GROUP BY "email"
    HAVING count(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'Cannot create unique index on "User"."email": % duplicate normalized email(s) exist. Merge or remove the duplicate accounts, then re-run this migration.', dup_count;
  END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

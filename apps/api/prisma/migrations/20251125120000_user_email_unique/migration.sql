-- Fail loudly if duplicate (case/whitespace-insensitive) emails already exist.
DO $$
DECLARE
  dup_count integer;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT lower(btrim("email"))
    FROM "User"
    GROUP BY lower(btrim("email"))
    HAVING count(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'Cannot create unique index on "User"."email": % duplicate normalized email(s) exist. Merge or remove the duplicate accounts, then re-run this migration.', dup_count;
  END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Single statement, no transaction: CONCURRENTLY cannot run inside one.
CREATE INDEX CONCURRENTLY "Feedback_workspaceId_createdAt_id_idx" ON "Feedback"("workspaceId", "createdAt", "id");

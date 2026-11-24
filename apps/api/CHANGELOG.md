# Changelog

## Unreleased

- Feedback list: stable cursor pagination (ties on createdAt broken by id), `count` runs in parallel with `findMany`, rows mapped once, and new `(workspaceId, createdAt, id)` index replaces `(workspaceId)`; web table now paginates server-side (HND-75)

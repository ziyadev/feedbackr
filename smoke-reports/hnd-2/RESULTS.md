# HND-2 smoke: `createFeedback` against `handoff/hnd-2-fixer-5` (PR #19)

Local sandbox only (Postgres `feedbackr` on 127.0.0.1:5432 + Redis). No production DB.

## Setup

- Branch under test: `handoff/hnd-2-fixer-5` @ `ef49fe1`
- `prisma db push` against empty local DB (schema already includes `Feedback`)
- Seeded user/workspace, then signed up `smoker2@test.local` and created workspace `roundtrip-ws2` (`cmwqgvhb20005qjbv5seh548y`) via GraphQL
- API: Nest GraphQL on `http://127.0.0.1:3852/graphql`

## Step results

### 1. Checkout + local API/DB — PASS

Prisma schema synced; Nest started successfully after building `@repo/utils` / `@repo/email`.

### 2. `createFeedback` mutation (public) — PASS (first try, no flake)

Unauthenticated POST (no cookies) with realistic payload:

```graphql
mutation($input: CreateFeedbackDto!) {
  createFeedback(input: $input) {
    id comment rating type pageUrl country priority status
    metadata { key value } userMetadata { key value }
  }
}
```

Variables:

```json
{
  "workspaceId": "cmwqgvhb20005qjbv5seh548y",
  "comment": "Unauth path: checkout CTA unclear on mobile.",
  "rating": 5,
  "type": "FEATURE",
  "pageUrl": "https://app.example.com/checkout",
  "country": "GB"
}
```

Response (`create_fb_unauth.json`): HTTP 200, returned id `cmwqgvo020009qjbvqinol82t` with echoed fields. Earlier create against `smoke-workspace` also succeeded (`create_feedback_1.json`).

Raw DB row: `metadata` / `userMetadata` stored as JSON **strings** (`"{}"`, typeof `string`).

### 3. Create-then-read serialization roundtrip — PASS

Admin session `getFeedbacks` after create (`get_fb_admin.json`):

```json
{
  "totalCount": 1,
  "nodes": [{
    "id": "cmwqgvo020009qjbvqinol82t",
    "comment": "Unauth path: checkout CTA unclear on mobile.",
    "rating": 5,
    "type": "FEATURE",
    "pageUrl": "https://app.example.com/checkout",
    "country": "GB",
    "metadata": [],
    "userMetadata": []
  }]
}
```

No `JSON.parse` throw. Empty arrays are expected for `JSON.stringify({})`.

First `getFeedbacks` call failed only due to bad test enums (`createdAt`/`desc` vs `CREATED_AT`/`DESC`) — not a product flake. Retry with correct enums succeeded.

### 4. Feedback flow / auth boundaries — PASS

- Introspection: `Mutation.createFeedback` is present.
- Unauthenticated `getFeedbacks` → `Forbidden resource` (`get_fb_noauth.json`) — expected.
- Unauthenticated `createFeedback` → success — public path reachable without workspace credentials.
- Authenticated admin `getFeedbacks` → lists the created row — no regression on read path.

## Suggested regression test (not committed)

Integration test: create via `createFeedback`, then `getFeedbacks` with a real Prisma DB, asserting mapper does not throw and `metadata`/`userMetadata` round-trip. Also assert that writing a real Json object `{}` (not `JSON.stringify({})`) into Prisma would break `FeedbackMapper.toModel` (`JSON.parse("[object Object]")`) — documents why the service stringifies.

## Note

`credentialsSignUp` saves session before `userService.create`, leaving `session.user.id` undefined until a subsequent login. Separate from this PR; smoke used `credentialsLogin` then `createWorkspace`.

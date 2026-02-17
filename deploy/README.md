# Production deploy (API + Web)

Single docker-compose for frontend and backend only. No database or cache store in this file; use your own Postgres (e.g. Supabase) and optionally set `CACHE_STORE_URL` or `REDIS_URL` for API caching.

**Run from repo root:**

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

API: port 10000. Web: port 10001. Set required env vars in `.env` in this directory or the repo root (e.g. `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, OAuth and Supabase keys, Stripe, `NEXT_PUBLIC_*` for web).

Optional: `CACHE_STORE_URL` (or `REDIS_URL`) for API cache store; if unset, API uses in-memory cache.

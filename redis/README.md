# Redis Setup for Mentara

This directory contains Docker Compose configuration for running Redis locally for development and testing.

## Quick Start

1. **Start Redis:**
   ```bash
   cd redis
   docker-compose up -d
   ```

2. **Check Redis status:**
   ```bash
   docker-compose ps
   ```

3. **Access Redis CLI:**
   ```bash
   docker-compose exec redis redis-cli
   ```

4. **Access Redis Commander (Web UI):**
   - Open browser: http://localhost:8081
   - Username: `admin`
   - Password: `admin`

5. **Stop Redis:**
   ```bash
   docker-compose down
   ```

6. **Stop and remove volumes (clean slate):**
   ```bash
   docker-compose down -v
   ```

## Configuration

- **Redis Port:** 6379
- **Redis Commander Port:** 8081
- **Data Persistence:** Enabled (AOF - Append Only File)
- **Memory Limit:** 256MB
- **Eviction Policy:** allkeys-lru (Least Recently Used)

## Environment Variables

Update your `.env` file in `mentara-api`:

```env
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Production Notes

For production, use a managed Redis service (AWS ElastiCache, Redis Cloud, etc.) and update the connection string accordingly.


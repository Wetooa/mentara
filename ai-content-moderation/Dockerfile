# Mentara AI Content Moderation Service - Production Dockerfile
FROM python:3.9-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --gid 1001 moderation && \
    useradd --uid 1001 --gid moderation --shell /bin/bash --create-home moderation

WORKDIR /app

# Install Python dependencies
FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Production image
FROM base AS runner

# Copy installed packages from deps stage
COPY --from=deps /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=moderation:moderation . .

# Create necessary directories
RUN mkdir -p /app/models/mental_health_classifier /app/models/toxicity_classifier /app/logs /app/data && \
    chown -R moderation:moderation /app

# Switch to non-root user
USER moderation

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

# Environment variables
ENV FLASK_ENV=production
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV OLLAMA_HOST=http://ollama:11434

# Start the application
CMD ["python", "api.py"]
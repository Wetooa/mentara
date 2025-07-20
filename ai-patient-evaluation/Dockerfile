# Mentara AI Service - Production Dockerfile
# AI/DevOps Agent Implementation
# Security-Hardened Flask ML Service

FROM python:3.11-slim

# Security: Create non-root user
RUN groupadd -r mentara && useradd -r -g mentara mentara

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy security configuration
COPY security_config.py .

# Create necessary directories
RUN mkdir -p /app/logs

# Set secure permissions
RUN chown -R mentara:mentara /app
RUN chmod 755 /app
RUN chmod 644 /app/*.py
RUN chmod 600 /app/mental_model_config2.pt 2>/dev/null || true

# Switch to non-root user
USER mentara

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["python", "api.py"]
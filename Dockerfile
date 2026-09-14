# =============================================================================
# Stage 1: Build dependencies
# =============================================================================
FROM python:3.13-slim AS builder

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies required for building Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        && \
    rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry==2.1.3

# Set working directory
WORKDIR /app

# Copy dependency files first (layer caching optimization)
COPY pyproject.toml poetry.lock ./

# Install dependencies without virtualenv inside container (no-root since app code is copied in stage 2)
RUN poetry config virtualenvs.create false && \
    poetry install --no-root --no-interaction --no-ansi

# =============================================================================
# Stage 2: Production image
# =============================================================================
FROM python:3.13-slim AS production

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=core.settings

# Install runtime system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libpq5 \
        && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r django && useradd -r -g django -d /app -s /bin/bash django

# Set working directory
WORKDIR /app

# Copy installed Python packages from builder stage
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin/gunicorn /usr/local/bin/gunicorn

# Copy application code
COPY . .

# Ensure start.sh has executable permissions
RUN chmod +x /app/start.sh

# Collect static files at build time
RUN DJANGO_SECRET_KEY=build-placeholder python manage.py collectstatic --noinput 2>/dev/null || true

# Ensure the non-root user owns the app directory
RUN chown -R django:django /app

# Switch to non-root user
USER django

# Expose common ports (Railway provides dynamic PORT)
EXPOSE 8000 8080

# Health check dynamically checking current PORT
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import os, urllib.request; port = os.getenv('PORT', '8000'); urllib.request.urlopen(f'http://127.0.0.1:{port}/health/')" || exit 1

# Start container using the production entrypoint script
CMD ["/app/start.sh"]

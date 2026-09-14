#!/usr/bin/env bash
set -e

# =============================================================================
# Booker Backend Startup Script for Railway & Containerized Environments
# =============================================================================

# 1. Run database migrations (enabled by default)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "==> Applying database migrations..."
    python manage.py migrate --noinput
else
    echo "==> Skipping database migrations (RUN_MIGRATIONS=${RUN_MIGRATIONS})"
fi

# 2. Optionally collect static files if enabled at runtime
if [ "${RUN_COLLECTSTATIC:-false}" = "true" ]; then
    echo "==> Collecting static files..."
    python manage.py collectstatic --noinput
fi

# 3. Port & Gunicorn Configuration
PORT="${PORT:-8000}"
WORKERS="${GUNICORN_WORKERS:-2}"
THREADS="${GUNICORN_THREADS:-4}"
TIMEOUT="${GUNICORN_TIMEOUT:-120}"

echo "==> Starting Gunicorn on 0.0.0.0:${PORT} (${WORKERS} workers, ${THREADS} threads, ${TIMEOUT}s timeout)..."

exec gunicorn core.wsgi:application \
    --bind "0.0.0.0:${PORT}" \
    --workers "${WORKERS}" \
    --threads "${THREADS}" \
    --timeout "${TIMEOUT}" \
    --access-logfile - \
    --error-logfile -

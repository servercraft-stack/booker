#!/usr/bin/env bash
set -e

# =============================================================================
# Booker Backend Startup Script for Railway & Containerized Environments
# =============================================================================

echo "==> Booting application container..."

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

# 3. Dynamic Port Selection
# Railway assigns $PORT dynamically. Fall back to 8000 only if unset.
APP_PORT="${PORT:-8000}"
WORKERS="${GUNICORN_WORKERS:-2}"
THREADS="${GUNICORN_THREADS:-4}"
TIMEOUT="${GUNICORN_TIMEOUT:-120}"

# 4. Auto-detect Django WSGI Module Path
if [ -f "core/wsgi.py" ]; then
    WSGI_MODULE="core.wsgi:application"
elif [ -f "booker/wsgi.py" ]; then
    WSGI_MODULE="booker.wsgi:application"
else
    WSGI_MODULE="${DJANGO_WSGI_MODULE:-core.wsgi:application}"
fi

echo "==> Starting Gunicorn on 0.0.0.0:${APP_PORT} using ${WSGI_MODULE} (${WORKERS} workers, ${THREADS} threads, ${TIMEOUT}s timeout)..."

# 5. Hand over process control to Gunicorn
exec gunicorn "${WSGI_MODULE}" \
    --bind "0.0.0.0:${APP_PORT}" \
    --workers "${WORKERS}" \
    --threads "${THREADS}" \
    --timeout "${TIMEOUT}" \
    --access-logfile - \
    --error-logfile -
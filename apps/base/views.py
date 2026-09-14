from django.http import JsonResponse
from django.db import connection


def ratelimited(request, exception):
    return JsonResponse(
        {
            "detail": "Too many requests. Please wait a moment and try again.",
        },
        status=429,
    )


def health_check(request):
    """
    Health check endpoint for Railway, Docker, and uptime monitoring.
    Verifies that Django is running and the database is accessible.
    """
    health = {
        "status": "ok",
        "database": "connected",
    }
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
        return JsonResponse(health, status=200)
    except Exception as e:
        health["status"] = "unhealthy"
        health["database"] = f"error: {str(e)}"
        return JsonResponse(health, status=503)

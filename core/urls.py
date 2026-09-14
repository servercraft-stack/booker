import os
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from apps.base.views import health_check

urlpatterns = [
    # Health check endpoint for Railway & container monitoring
    path('health/', health_check, name='health_check'),

    # Admin
    path('admin/', admin.site.urls),

    # API: Users & Auth
    path('api/users/', include('apps.user.urls')),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # API: Apartments, Bookings, Reviews
    path('api/apartments/', include('apps.apartments.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/reviews/', include('apps.reviews.urls')),

    # API: Host Dashboard
    path('api/host/', include('apps.host.urls')),
]

# DRF-Spectacular / OpenAPI docs — available in debug or when ENABLE_DOCS=true
if settings.DEBUG or os.getenv("ENABLE_DOCS", "false").lower() in ("true", "1", "yes"):
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ]

# Serve media in debug mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

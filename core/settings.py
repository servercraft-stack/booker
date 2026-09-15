import os
from pathlib import Path
from datetime import timedelta
import cloudinary
import dj_database_url
from dotenv import load_dotenv


from dotenv import load_dotenv
from decouple import config


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Core Security & Debug ───────────────────────────────────────────────────
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "django-insecure-dev-fallback-key-for-local-testing-only"
    else:
        raise RuntimeError("DJANGO_SECRET_KEY environment variable must be set in production.")

# ─── Hosts & Origins ─────────────────────────────────────────────────────────
ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv(
        "ALLOWED_HOSTS",
        "localhost,127.0.0.1",
    ).split(",")
    if h.strip()
]
if "testserver" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append("testserver")

# Automatically support Railway deployment domain
RAILWAY_PUBLIC_DOMAIN = os.getenv("RAILWAY_PUBLIC_DOMAIN")
if RAILWAY_PUBLIC_DOMAIN and RAILWAY_PUBLIC_DOMAIN not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RAILWAY_PUBLIC_DOMAIN)

# Auto-allow railway wildcard hosts if in Railway environment
if os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("RAILWAY_SERVICE_NAME"):
    for domain in [".railway.app", ".up.railway.app"]:
        if domain not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(domain)

CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if o.strip()
]

if RAILWAY_PUBLIC_DOMAIN:
    railway_origin = f"https://{RAILWAY_PUBLIC_DOMAIN}"
    if railway_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(railway_origin)

# ─── Installed Applications ──────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    "django_filters",
    "cloudinary",
    "cloudinary_storage",
    "django_ratelimit",

    "apps.base",
    "apps.user",
    "apps.apartments",
    "apps.bookings",
    "apps.reviews",
    "apps.host",
    "apps.notifications",
    "rest_framework_simplejwt.token_blacklist",
]

# ─── Middleware ──────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django_ratelimit.middleware.RatelimitMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR, "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# ─── Database ────────────────────────────────────────────────────────────────
# Railway automatically injects DATABASE_URL for attached PostgreSQL services.
# When DATABASE_URL is present, use dj-database-url with connection pooling.

# sslmode is only meaningful for Postgres; leave DB_SSLMODE empty to run
# against SQLite (e.g. local test runs).
_DB_OPTIONS = {}
if config("DB_SSLMODE", default="require"):
    _DB_OPTIONS["sslmode"] = config("DB_SSLMODE", default="require")

DATABASES = {
    "default": {
        "ENGINE": os.getenv("DB_ENGINE"),
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
        "OPTIONS": _DB_OPTIONS,
        "CONN_MAX_AGE": config("DB_CONN_MAX_AGE", default=600, cast=int),
        "CONN_HEALTH_CHECKS": True,
    }
}

AUTH_USER_MODEL = "user.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── Internationalization ────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ─── Static & Media Files ────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── CORS ────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL_ORIGINS", "false").lower() in ("true", "1", "yes")
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

# ─── Django Rest Framework ───────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'register': '5/hour',
        'login': '10/minute',
        'otp': '6/minute',
        'password_reset': '5/hour',
        'password_change': '5/hour',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Apartment Booking API",
    "DESCRIPTION": "API for single-owner apartment booking platform",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "SECURITY": [{"BearerAuth": []}],
    "SECURITY_DEFINITIONS": {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    },
    "ENUM_NAME_OVERRIDES": {},
}

# ─── Cache & Ratelimit ───────────────────────────────────────────────────────
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'streams-a-lot-dev-cache',
    },
}

REDIS_URL = os.getenv('REDIS_URL')
if REDIS_URL:
    CACHES['ratelimit'] = {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
    }
else:
    CACHES['ratelimit'] = {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'ratelimit-local-cache',
    }

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

RATELIMIT_ENABLE = os.getenv('RATELIMIT_ENABLE', 'False').lower() in ('true', '1', 'yes')
RATELIMIT_USE_CACHE = 'ratelimit'
RATELIMIT_VIEW = 'apps.base.views.ratelimited'

# Silence ratelimit shared-cache check when falling back to LocMemCache
SILENCED_SYSTEM_CHECKS = [
    "django_ratelimit.E003",
    "django_ratelimit.W001",
]

# ─── Integrations: Stripe, Frontend, Cloudinary, Email ────────────────────────
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY")
STRIPE_CURRENCY = os.getenv("STRIPE_CURRENCY", "usd")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

GOOGLE_OAUTH_CLIENT_ID = os.getenv("GOOGLE_OAUTH_CLIENT_ID")

# ─── Email (via Anymail / Brevo) ──────────────────────────────────────────────
# Railway free tier blocks outbound SMTP (ports 25/465/587), so we use
# Anymail to send through Brevo's HTTPS API instead.
INSTALLED_APPS += ["anymail"]

# Preferred backend name in recent Anymail versions
EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"

ANYMAIL = {
    # Anymail recognizes both BREVO_API_KEY and SENDINBLUE_API_KEY
    "BREVO_API_KEY": os.getenv("BREVO_API_KEY"),
    "SENDINBLUE_API_KEY": os.getenv("BREVO_API_KEY"),
}

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@yourdomain.com")
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Brevo silently drops (returns 201 but never delivers) mail from a sender that
# is not verified under Senders, Domains & Dedicated IPs. Fail loudly at startup
# if the placeholder default is still in use.
if DEFAULT_FROM_EMAIL == "noreply@yourdomain.com":
    import warnings

    warnings.warn(
        "DEFAULT_FROM_EMAIL is still the placeholder 'noreply@yourdomain.com'. "
        "Brevo only delivers mail from senders verified in its dashboard "
        "(Senders, Domains & Dedicated IPs) — set DEFAULT_FROM_EMAIL to a "
        "verified address or the 201-accepted messages will never arrive.",
        stacklevel=0,
    )
# Ensure Resend / Anymail errors are visible in Railway logs
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "anymail": {
            "level": "DEBUG",
            "handlers": ["console"],
        },
        "apps.base.account_utils": {
            "level": "DEBUG",
            "handlers": ["console"],
        },
    },
}

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# ─── Reverse Proxy & Production Security ─────────────────────────────────────
# Railway terminates SSL at the edge proxy and forwards HTTPS requests with this header
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

if not DEBUG:
    SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "true").lower() in ("true", "1", "yes")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
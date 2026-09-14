from django.apps import AppConfig


class ApartmentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.apartments'

    def ready(self):
        import apps.apartments.signals

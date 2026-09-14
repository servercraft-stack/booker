from django.urls import path
from .views import HostDashboardStatsView

urlpatterns = [
    path('dashboard-stats/', HostDashboardStatsView.as_view(), name='host-dashboard-stats'),
]

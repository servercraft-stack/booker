from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum

from apps.apartments.models import Apartment
from apps.bookings.models import Booking


class HostDashboardStatsView(APIView):
    """
    Returns aggregated stats for the authenticated host:
    - total_listings: count of all apartments owned by the host
    - active_listings: count of active apartments
    - total_bookings: count of confirmed bookings across host's apartments
    - total_revenue: sum of total_price for paid bookings
    - currency: default currency (GBP)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        host_apartments = Apartment.objects.filter(host=user)

        total_listings = host_apartments.count()
        active_listings = host_apartments.filter(is_active=True).count()

        confirmed_bookings = Booking.objects.filter(
            apartment__host=user,
            status='confirmed',
        )
        total_bookings = confirmed_bookings.count()

        revenue = Booking.objects.filter(
            apartment__host=user,
            payment_status='paid',
        ).aggregate(
            total=Sum('total_price')
        )['total'] or 0

        return Response({
            'total_listings': total_listings,
            'active_listings': active_listings,
            'total_bookings': total_bookings,
            'total_revenue': float(revenue),
            'currency': 'GBP',
        })

from django.urls import path
from .views import (
    ApartmentBookingListCreateView,
    MyBookingsView,
    BookingDetailView,
    CreateCheckoutSessionView,
    DeleteCancelledBookingView,
    VerifyPaymentView,
    stripe_webhook,
)

urlpatterns = [
    path(
        "apartments/<uuid:apartment_id>/bookings/",
        ApartmentBookingListCreateView.as_view(),
        name="apartment-bookings"
    ),
    path(
        "my-bookings/",
        MyBookingsView.as_view(),
        name="my-bookings"
    ),
    path(
        "bookings/<uuid:id>/",
        BookingDetailView.as_view(),
        name="booking-detail"
    ),
    path(
        "bookings/<uuid:booking_id>/pay/",
        CreateCheckoutSessionView.as_view(),
        name="create-checkout-session"
    ),
    path(
        "bookings/<uuid:booking_id>/delete/",
        DeleteCancelledBookingView.as_view(),
        name="delete-cancelled-booking"
    ),
    path(
        "bookings/<uuid:booking_id>/verify-payment/",
        VerifyPaymentView.as_view(),
        name="verify-payment"
    ),
    path(
        "webhooks/stripe/",
        stripe_webhook,
        name="stripe-webhook"
    ),
]
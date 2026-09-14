from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django_filters import rest_framework as filters
from drf_yasg.utils import swagger_auto_schema

from .models import Apartment
from .serializers import ApartmentSerializer
from .utils import (
    get_cached_active_apartments,
    get_cached_apartment_detail
)


class ApartmentFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    property_type = filters.CharFilter(field_name='property_type', lookup_expr='exact')
    min_price = filters.NumberFilter(field_name='pricing__price_per_night', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='pricing__price_per_night', lookup_expr='lte')
    max_guests = filters.NumberFilter(field_name='max_guests', lookup_expr='gte')

    class Meta:
        model = Apartment
        fields = ['property_type', 'min_price', 'max_price', 'max_guests']

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(address__city__icontains=value) |
            Q(address__country__icontains=value)
        )

class ApartmentListAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(responses={200: ApartmentSerializer(many=True)})
    def get(self, request):
        apartments = get_cached_active_apartments()  
        serializer = ApartmentSerializer(apartments, many=True)
        return Response(serializer.data)


class ApartmentDetailAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(responses={200: ApartmentSerializer})
    def get(self, request, pk):
        apartment = get_cached_apartment_detail(pk)  

        if apartment is None:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ApartmentSerializer(apartment)
        return Response(serializer.data)


class ApartmentListCreateView(generics.ListCreateAPIView):
    queryset = Apartment.objects.filter(is_active=True)
    serializer_class = ApartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = ApartmentFilter

    @swagger_auto_schema(responses={200: ApartmentSerializer(many=True)})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=ApartmentSerializer,
        responses={201: ApartmentSerializer}
    )
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        image_file = request.FILES.get('image_file') or request.FILES.get('image')
        if image_file:
            data['image_file'] = image_file
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        apartment = serializer.save(host=request.user)
        return Response(
            ApartmentSerializer(apartment).data,
            status=status.HTTP_201_CREATED
        )


class ApartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Apartment.objects.all()
    serializer_class = ApartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "pk"

    @swagger_auto_schema(responses={200: ApartmentSerializer})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=ApartmentSerializer,
        responses={200: ApartmentSerializer}
    )
    def put(self, request, *args, **kwargs):
        apartment = self.get_object()

        if apartment.host != request.user:
            return Response(
                {"error": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        image_file = request.FILES.get('image_file') or request.FILES.get('image')
        if image_file:
            apartment.image = image_file
            apartment.save(update_fields=['image'])

        serializer = self.get_serializer(apartment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        apartment = serializer.save()

        return Response(
            ApartmentSerializer(apartment).data,
            status=status.HTTP_200_OK
        )

    @swagger_auto_schema(
        request_body=ApartmentSerializer,
        responses={200: ApartmentSerializer}
    )
    def patch(self, request, *args, **kwargs):
        apartment = self.get_object()

        if apartment.host != request.user:
            return Response(
                {"error": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        image_file = request.FILES.get('image_file') or request.FILES.get('image')
        if image_file:
            apartment.image = image_file
            apartment.save(update_fields=['image'])

        # Handle other fields through serializer
        serializer = self.get_serializer(apartment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            ApartmentSerializer(apartment).data,
            status=status.HTTP_200_OK
        )

    def delete(self, request, *args, **kwargs):
        apartment = self.get_object()

        if apartment.host != request.user:
            return Response(
                {"error": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().delete(request, *args, **kwargs)

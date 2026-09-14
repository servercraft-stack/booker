from rest_framework import serializers
from PIL import Image, UnidentifiedImageError
from drf_spectacular.utils import extend_schema_field
from cloudinary.utils import cloudinary_url
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from .models import (
    Apartment,
    Amenity,
    ApartmentPricing,
    ApartmentAddress,
    ApartmentAvailability,
    ApartmentRule
)
from apps.bookings.models import Booking


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'icon']


class ApartmentRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentRule
        fields = ['id', 'rule_text']


class ApartmentPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentPricing
        fields = [
            'price_per_night',
            'cleaning_fee',
            'service_fee',
            'weekend_price',
            'currency'
        ]


class ApartmentAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentAddress
        fields = ['country', 'state', 'city', 'street']


class ApartmentAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentAvailability
        fields = ['date', 'is_available']


class ApartmentSerializer(serializers.ModelSerializer):
    pricing = ApartmentPricingSerializer(required=False)
    address = ApartmentAddressSerializer(required=False)
    apartment_amenities = serializers.SerializerMethodField()
    rules = ApartmentRuleSerializer(many=True, required=False)
    availability = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    image_file = serializers.FileField(write_only=True, required=False)
    amenities = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Amenity.objects.all(), required=False
    )

    class Meta:
        model = Apartment
        fields = [
            'id',
            'host',
            'title',
            'description',
            'property_type',
            'total_bedrooms',
            'total_bathrooms',
            'max_guests',
            'is_active',
            'is_verified',
            'created_at',
            'updated_at',
            'apartment_amenities',
            'amenities',
            'rules',
            'availability',
            'image_file',
            'image_url',
            'is_cover',
            'uploaded_at',
            'pricing',
            'address',
        ]
        read_only_fields = ['host', 'is_verified']

    @extend_schema_field(serializers.URLField)
    def get_image_url(self, obj):
        if obj.image:
            url, _ = cloudinary_url(str(obj.image), secure=True)
            return url
        return None

    @extend_schema_field(ApartmentAvailabilitySerializer(many=True))
    def get_availability(self, obj):
        availability_dates = {
            av.date: av.is_available
            for av in obj.availability.all()
        }

        booked_dates = set(
            Booking.objects.filter(
                apartment=obj,
                status__in=['pending', 'confirmed'],
                check_out__gte=timezone.localdate(),
            ).values_list('check_in', flat=True).order_by('check_in')
        )

        booked_date_set = set()
        for booking in Booking.objects.filter(
            apartment=obj,
            status__in=['pending', 'confirmed'],
            check_out__gte=timezone.localdate(),
        ):
            current = booking.check_in
            while current < booking.check_out:
                booked_date_set.add(current)
                current += timezone.timedelta(days=1)

        
        result = []
        all_dates = set(availability_dates.keys()) | booked_date_set

        for date in sorted(all_dates):
            if date in availability_dates:
                
                is_available = availability_dates[date] and date not in booked_date_set
            else:
                is_available = date not in booked_date_set

            result.append({'date': str(date), 'is_available': is_available})

        return result

    @extend_schema_field(AmenitySerializer(many=True))
    def get_apartment_amenities(self, obj):
        return AmenitySerializer(obj.amenities.all(), many=True).data

    def create(self, validated_data):
        pricing_data = validated_data.pop('pricing', None)
        address_data = validated_data.pop('address', None)
        rules_data = validated_data.pop('rules', [])
        amenities = validated_data.pop('amenities', [])
        image_file = validated_data.pop('image_file', None)

        with transaction.atomic():
            apartment = Apartment.objects.create(**validated_data)

            if image_file:
                apartment.image = image_file
                apartment.save(update_fields=['image'])

            if pricing_data:
                ApartmentPricing.objects.create(apartment=apartment, **pricing_data)

            if address_data:
                ApartmentAddress.objects.create(apartment=apartment, **address_data)

            if rules_data:
                ApartmentRule.objects.bulk_create([
                    ApartmentRule(apartment=apartment, **rule) for rule in rules_data
                ])

            if amenities:
                apartment.amenities.set(amenities)

        return apartment

    def update(self, instance, validated_data):
        pricing_data = validated_data.pop('pricing', None)
        address_data = validated_data.pop('address', None)
        amenities = validated_data.pop('amenities', None)
        image_file = validated_data.pop('image_file', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if image_file:
            instance.image = image_file
            instance.save(update_fields=['image'])

        if pricing_data:
            pricing, _ = ApartmentPricing.objects.get_or_create(apartment=instance)
            for attr, value in pricing_data.items():
                setattr(pricing, attr, value)
            pricing.save()

        if address_data:
            address, _ = ApartmentAddress.objects.get_or_create(apartment=instance)
            for attr, value in address_data.items():
                setattr(address, attr, value)
            address.save()

        if amenities is not None:
            instance.amenities.set(amenities)

        return instance

    MAX_UPLOAD_SIZE = 5 * 1024 * 1024
    ALLOWED_IMAGE_TYPES = {'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'}

    def validate_image_file(self, value):
        if hasattr(value, 'content_type') and not value.content_type.startswith('image/'):
            raise serializers.ValidationError("Only image files are allowed.")

        if hasattr(value, 'size') and value.size > self.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                f"Image file too large. Maximum allowed size is {self.MAX_UPLOAD_SIZE // (1024 * 1024)} MB."
            )

        try:
            img = Image.open(value)
            img.verify()
            value.seek(0)
            img = Image.open(value)
            fmt = img.format
            if fmt and fmt.lower() not in self.ALLOWED_IMAGE_TYPES:
                raise serializers.ValidationError(
                    f"Unsupported image format '{fmt}'. Allowed: {', '.join(sorted(self.ALLOWED_IMAGE_TYPES))}."
                )
        except (UnidentifiedImageError, IOError, SyntaxError):
            raise serializers.ValidationError("Invalid image file.")
        finally:
            if hasattr(value, 'seek'):
                value.seek(0)

        return value
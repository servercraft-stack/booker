from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'apartment', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'apartment', 'created_at']

    def get_user_name(self, obj):
        full_name = obj.user.get_full_name()
        if full_name:
            return full_name
        return obj.user.email.split('@')[0]

    def validate(self, attrs):
        user = self.context['request'].user
        apartment = self.context['apartment_id']

        if Review.objects.filter(user=user, apartment=apartment).exists():
            raise serializers.ValidationError(
                "You have already submitted a review for this apartment."
            )

        return attrs

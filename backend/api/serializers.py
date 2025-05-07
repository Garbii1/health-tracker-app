from django.contrib.auth.models import User
from rest_framework import serializers
from .models import HealthMetric, Meal, FitnessGoal
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name') # Exclude password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    # TEMPORARY: Remove write_only and required
    password2 = serializers.CharField(label="Confirm password") # TEMPORARY CHANGE
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        # Keep password2 in fields for now
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            # Remove password2 from extra_kwargs temporarily if needed
            # 'password2': {'write_only': True} # TEMPORARY REMOVAL
        }

    def validate(self, attrs):
        # Keep validation logic
        password = attrs.get('password')
        password2 = attrs.get('password2')
        if not password2:
             raise serializers.ValidationError({"password2": "Password confirmation is required."})
        if password != password2:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        # ... email check ...
        return attrs

    def create(self, validated_data):
        # Explicitly pop password2 as it's no longer write_only
        validated_data.pop('password2', None)
        # ... rest of create method ...
        user = User.objects.create(**validated_data) # Simplified create
        user.set_password(validated_data['password']) # Set password AFTER initial create
        user.save()
        return user

# --- Rest of the serializers remain the same ---

class HealthMetricSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = HealthMetric
        fields = ['id', 'user', 'weight', 'steps', 'heart_rate', 'timestamp']

class MealSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Meal
        fields = ['id', 'user', 'name', 'calories', 'timestamp']

class FitnessGoalSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = FitnessGoal
        fields = ['id', 'user', 'goal_text', 'created_at', 'completed', 'completed_at']
        read_only_fields = ['created_at', 'completed_at']
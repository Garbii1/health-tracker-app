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
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = { # Ensure password is not read back
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        # Basic email uniqueness check (Django User model enforces username uniqueness)
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])

        # Password validation during user creation
        try:
            validate_password(validated_data['password'], user)
        except DjangoValidationError as e:
             # Rollback user creation if password validation fails (though validated before)
            user.delete()
            raise serializers.ValidationError({'password': list(e.messages)})

        user.save()
        return user


class HealthMetricSerializer(serializers.ModelSerializer):
    # Make user read-only, it will be set automatically based on the request user
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
        read_only_fields = ['created_at', 'completed_at'] # These are set automatically
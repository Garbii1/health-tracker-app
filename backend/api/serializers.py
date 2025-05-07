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
    # REMOVE required=True from password2
    password2 = serializers.CharField(write_only=True, label="Confirm password") # Removed required=True
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        # Keep password2 in fields so it's processed from input, but not required by default
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            # Explicitly make password2 write_only here too, good practice
            'password2': {'write_only': True}
        }

    def validate(self, attrs):
        # Use .get() for safer access in case password2 wasn't provided (though form should ensure it is)
        password = attrs.get('password')
        password2 = attrs.get('password2')

        if not password2:
             # If password2 wasn't sent at all (shouldn't happen with form validation)
             raise serializers.ValidationError({"password2": "Password confirmation is required."})

        if password != password2:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Basic email uniqueness check
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        return attrs

    def create(self, validated_data):
        # Remove password2 before creating the user if it somehow exists in validated_data (it shouldn't due to write_only)
        validated_data.pop('password2', None)

        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])

        # Password validation can still happen here if desired, though validators=[] handles it too
        # try:
        #     validate_password(validated_data['password'], user)
        # except DjangoValidationError as e:
        #     user.delete()
        #     raise serializers.ValidationError({'password': list(e.messages)})

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
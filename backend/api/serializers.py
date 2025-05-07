from django.contrib.auth.models import User
from rest_framework import serializers
from .models import HealthMetric, Meal, FitnessGoal
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    # --- TEMPORARY DEBUG CHANGE ---
    # Removed write_only=True and required=True
    password2 = serializers.CharField(label="Confirm password")
    # --- END TEMPORARY DEBUG CHANGE ---
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        # Keep password2 in fields so serializer processes it from input initially
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            # password2 is no longer write_only temporarily
        }

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')

        # Explicitly check if password2 exists now, since it's not required=True anymore
        if not password2:
             raise serializers.ValidationError({"password2": "Password confirmation is required."}) # This might be hit now

        if password != password2:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        return attrs

    def create(self, validated_data):
        # Explicitly remove password2 before creating the user, as it's NOT write_only now
        password2 = validated_data.pop('password2', None) # Remove it safely

        # We also need to remove password before mass assignment if it wasn't write_only
        # But since password IS write_only, it won't be in validated_data passed here by default DRF create.
        # However, to be safe, let's pop it AFTER we use it.
        password_to_set = validated_data.pop('password')

        # Create user with remaining validated data
        user = User.objects.create(**validated_data)
        user.set_password(password_to_set) # Set the password correctly

        # Re-add password validation here if needed (though validators=[] should handle it)
        # try:
        #     validate_password(password_to_set, user)
        # except DjangoValidationError as e:
        #     user.delete() # Rollback
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
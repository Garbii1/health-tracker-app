# backend/api/views.py

import logging # Import the logging library
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import serializers # Import for ValidationError logging
from django.contrib.auth.models import User
# Removed unused 'authenticate' import

from .models import HealthMetric, Meal, FitnessGoal
from .serializers import (
    UserSerializer, RegisterSerializer, HealthMetricSerializer,
    MealSerializer, FitnessGoalSerializer
)

# Get an instance of a logger for this module
logger = logging.getLogger(__name__)

# --- Permissions ---

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view or edit it.
    Assumes the object has a 'user' attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the object's user is the same as the request's user
        return obj.user == request.user

# --- Authentication Views ---

class RegisterView(generics.CreateAPIView):
    """
    View for handling new user registration.
    Accepts POST requests with username, email, password, password2, etc.
    Returns user data and auth token upon successful registration.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allow anyone to access this endpoint
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # --- ADDED LOGGING: Log incoming request data ---
        # Be cautious logging raw request data in production if it might contain sensitive info
        # beyond what's needed for debugging. Consider logging only specific fields if necessary.
        logger.info(f"Registration attempt received for username: {request.data.get('username')}, email: {request.data.get('email')}")
        # For deeper debugging (use temporarily if needed):
        # logger.debug(f"Full registration request data: {request.data}")
        # --- END LOGGING ---

        serializer = self.get_serializer(data=request.data)
        try:
            # Validate the data using the serializer
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
             # --- ADDED LOGGING: Log validation errors ---
             logger.error(f"Registration validation failed for username '{request.data.get('username')}'. Errors: {e.detail}")
             # --- END LOGGING ---
             raise e # Re-raise the exception to return 400 response

        # If validation passes, save the user (serializer's create method is called)
        user = serializer.save()

        # --- ADDED LOGGING: Log successful registration ---
        logger.info(f"User '{user.username}' registered successfully (ID: {user.id}).")
        # --- END LOGGING ---

        # Create or get an authentication token for the new user
        token, created = Token.objects.get_or_create(user=user)

        # Return the serialized user data and the token
        return Response({
            # Use UserSerializer to control which user fields are returned
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)


class CustomAuthToken(ObtainAuthToken):
    """
    Custom login view based on DRF's ObtainAuthToken.
    Returns the auth token along with basic user details upon successful login.
    """
    permission_classes = (permissions.AllowAny,) # Allow anyone to attempt login

    def post(self, request, *args, **kwargs):
        logger.info(f"Login attempt received for username: {request.data.get('username')}") # Log login attempt
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            logger.warning(f"Login validation failed for username '{request.data.get('username')}'. Errors: {e.detail}")
            raise e

        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        logger.info(f"User '{user.username}' logged in successfully.")
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email
            # Add other fields like first/last name if needed
            # 'first_name': user.first_name,
            # 'last_name': user.last_name,
        })

# --- User Data View ---

class CurrentUserView(generics.RetrieveAPIView):
    """
    View to retrieve details of the currently authenticated user.
    Requires authentication token in the request header.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated] # User must be logged in

    def get_object(self):
        # Returns the user associated with the current request's token
        logger.debug(f"Fetching current user details for user: {self.request.user.username}")
        return self.request.user

# --- CRUD ViewSets for User-Owned Data ---

class BaseUserOwnedViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet that automatically filters querysets by the request user
    and assigns the request user upon creation.
    Requires IsAuthenticated and IsOwner permissions.
    """
    # Permissions required: Must be logged in, must own the specific object for detail views (update/delete)
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        """
        Filter the queryset to return only objects owned by the current user.
        """
        # Ensure the base queryset is defined in the inheriting class
        if not hasattr(self, 'queryset'):
            raise NotImplementedError("Subclasses must define a 'queryset' attribute.")

        user = self.request.user
        logger.debug(f"Filtering {self.queryset.model.__name__} queryset for user: {user.username}")
        # Filter by the 'user' foreign key field on the model
        return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        """
        Automatically associate the object with the logged-in user upon creation.
        """
        user = self.request.user
        instance = serializer.save(user=user) # Pass the user object to the serializer's save method
        logger.info(f"{self.queryset.model.__name__} created (ID: {instance.id}) for user: {user.username}")

    # Standard list, retrieve, update, destroy actions inherit permission checks.
    # get_queryset ensures list/retrieve only show user's own data.
    # IsOwner permission ensures update/destroy only work on user's own specific object.


class HealthMetricViewSet(BaseUserOwnedViewSet):
    """
    API endpoint that allows users to CREATE, READ, UPDATE, DELETE their health metrics.
    Inherits user filtering and ownership permissions from BaseUserOwnedViewSet.
    """
    queryset = HealthMetric.objects.all() # Base queryset (will be filtered by user)
    serializer_class = HealthMetricSerializer


class MealViewSet(BaseUserOwnedViewSet):
    """
    API endpoint that allows users to CREATE, READ, UPDATE, DELETE their meal logs.
    Inherits user filtering and ownership permissions from BaseUserOwnedViewSet.
    """
    queryset = Meal.objects.all()
    serializer_class = MealSerializer


class FitnessGoalViewSet(BaseUserOwnedViewSet):
    """
    API endpoint that allows users to CREATE, READ, UPDATE, DELETE their fitness goals.
    Inherits user filtering and ownership permissions from BaseUserOwnedViewSet.
    """
    queryset = FitnessGoal.objects.all()
    serializer_class = FitnessGoalSerializer
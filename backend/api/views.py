from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from .models import HealthMetric, Meal, FitnessGoal
from .serializers import (
    UserSerializer, RegisterSerializer, HealthMetricSerializer,
    MealSerializer, FitnessGoalSerializer
)

# Custom Permission: IsOwner
class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Instance must have an attribute named `user`.
        return obj.user == request.user

# User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allow anyone to register
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)


# Custom Login View to return user data along with token
class CustomAuthToken(ObtainAuthToken):
    permission_classes = (permissions.AllowAny,) # Allow anyone to attempt login

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email
        })

# Current User View
class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated] # Must be logged in

    def get_object(self):
        return self.request.user # Return the currently logged-in user


# Base ViewSet for common functionality (filtering by user)
class BaseUserOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner] # Must be logged in and own the object

    def get_queryset(self):
        """
        This view should return a list of all the objects
        for the currently authenticated user.
        """
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Associate the object with the logged-in user upon creation.
        """
        serializer.save(user=self.request.user)

# ViewSets for CRUD operations
class HealthMetricViewSet(BaseUserOwnedViewSet):
    queryset = HealthMetric.objects.all()
    serializer_class = HealthMetricSerializer

class MealViewSet(BaseUserOwnedViewSet):
    queryset = Meal.objects.all()
    serializer_class = MealSerializer

class FitnessGoalViewSet(BaseUserOwnedViewSet):
    queryset = FitnessGoal.objects.all()
    serializer_class = FitnessGoalSerializer
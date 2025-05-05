# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, CustomAuthToken, CurrentUserView,
    HealthMetricViewSet, MealViewSet, FitnessGoalViewSet
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'metrics', HealthMetricViewSet, basename='healthmetric')
router.register(r'meals', MealViewSet, basename='meal')
router.register(r'goals', FitnessGoalViewSet, basename='fitnessgoal')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'), # Use our custom login
    path('user/', CurrentUserView.as_view(), name='current-user'), # Get current user info
    path('', include(router.urls)), # Include the router URLs
]
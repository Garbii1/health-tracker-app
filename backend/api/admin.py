from django.contrib import admin
from .models import HealthMetric, Meal, FitnessGoal

# Simple registration for basic admin access
@admin.register(HealthMetric)
class HealthMetricAdmin(admin.ModelAdmin):
    list_display = ('user', 'timestamp', 'weight', 'steps', 'heart_rate')
    list_filter = ('user', 'timestamp')
    search_fields = ('user__username',)

@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = ('user', 'timestamp', 'name', 'calories')
    list_filter = ('user', 'timestamp')
    search_fields = ('user__username', 'name')

@admin.register(FitnessGoal)
class FitnessGoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'goal_text', 'created_at', 'completed', 'completed_at')
    list_filter = ('user', 'completed', 'created_at')
    search_fields = ('user__username', 'goal_text')

# You might want to customize the User admin as well if needed
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from django.contrib.auth.models import User

# class UserAdmin(BaseUserAdmin):
#     pass # Add customizations here if needed

# admin.site.unregister(User)
# admin.site.register(User, UserAdmin)
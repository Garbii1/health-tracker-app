from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class HealthMetric(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_metrics')
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True) # e.g., in kg or lbs
    steps = models.PositiveIntegerField(null=True, blank=True)
    heart_rate = models.PositiveIntegerField(null=True, blank=True) # Beats per minute
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-timestamp'] # Show newest first

class Meal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meals')
    name = models.CharField(max_length=200)
    calories = models.PositiveIntegerField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.name} ({self.calories} kcal) at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-timestamp']

class FitnessGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fitness_goals')
    goal_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        status = "Completed" if self.completed else "Pending"
        return f"{self.user.username} - Goal: {self.goal_text[:50]}... ({status})"

    def save(self, *args, **kwargs):
        # Set completed_at timestamp when goal is marked completed
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']
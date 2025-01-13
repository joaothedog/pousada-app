#rooms/models.py
from django.db import models
from reservations.models import Reservation

class Room(models.Model):
    ROOM_TYPES = [
        ('SIMPLES', 'Simples'),
        ('DUPLO', 'Duplo'),
        ('LUXO', 'Luxo'),
    ]
    
    name = models.CharField(max_length=255)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES)
    capacity = models.PositiveIntegerField()
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    def is_available_for_period(self, check_in, check_out):
        overlapping_reservation = Reservation.objects.filter(
            room=self,
            check_in__lt=check_out,
            check_out__gt=check_in
        ).exists()
        return not overlapping_reservation
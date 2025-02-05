#rooms/models.py
from django.db import models
from reservations.models import Reservation
class Room(models.Model):
    ROOM_TYPES = [
        ('SIMPLES', 'Individual (1)'),
        ('DUPLO', 'Duplo (2)'),
        ('TRIPLO', 'Triplo (3)'),
        ('QUADRUPLO', 'Quadruplo (4)'),
        ('QUINTUPLO', 'Quintuplo (5)'),
        ('SEXTUPLO', 'Sextuplo (6)'),
    ]
    
    COOLING_CHOICES = [
        ('AR_CONDICIONADO', 'Ar-condicionado'),
        ('VENTILADOR', 'Ventilador'),
    ]
    
    name = models.CharField(max_length=255)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES)
    cooling_type = models.CharField(max_length=15, choices=COOLING_CHOICES, default=1)  # Ar-condicionado ou ventilador
    capacity = models.PositiveIntegerField()
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_room_type_display()} ({self.get_cooling_type_display()})"
    
    def is_available_for_period(self, check_in, check_out):
        overlapping_reservation = Reservation.objects.filter(
            room=self,
            check_in__lt=check_out,
            check_out__gt=check_in
        ).exists()
        return not overlapping_reservation
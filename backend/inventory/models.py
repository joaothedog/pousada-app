#inventory/models.py
from django.db import models

class InventoryItem(models.Model):
    LOCATION_CHOICES = [
        ('RECEPCAO', 'Recepção'),
        ('COZINHA', 'Cozinha'),
    ]

    name = models.CharField(max_length=100)
    location = models.CharField(max_length=10, choices=LOCATION_CHOICES)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.name} - {self.location}"
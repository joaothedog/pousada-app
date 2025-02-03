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

class InventoryConsumption(models.Model):
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='consumptions')
    quantity = models.IntegerField()
    description = models.CharField(max_length=255, blank=True, null=True)
    consumed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item.name} - {self.quantity} consumidos em {self.consumed_at}"

    def save(self, *args, **kwargs):
        self.item.quantity -= self.quantity
        self.item.save()
        super().save(*args, **kwargs)
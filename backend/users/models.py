#users/models.py
from django.db import models

class Guest(models.Model):
    name = models.CharField(max_length=255)
    cpf = models.CharField(max_length=255, unique=True)
    phone = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    
    def __str__(self):
        return self.name
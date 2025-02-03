from rest_framework import serializers
from .models import InventoryItem, InventoryConsumption

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class InventoryConsumptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryConsumption
        fields = ['id', 'item', 'quantity', 'description', 'consumed_at']
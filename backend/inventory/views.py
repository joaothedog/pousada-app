#inventory/views.py
from rest_framework import generics
from .models import InventoryItem, InventoryConsumption
from .serializers import InventoryItemSerializer, InventoryConsumptionSerializer

class InventoryItemListCreateView(generics.ListCreateAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    
class InventoryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    
class InventoryConsumptionListCreateView(generics.ListCreateAPIView):
    queryset = InventoryConsumption.objects.all()
    serializer_class = InventoryConsumptionSerializer

class InventoryConsumptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryConsumption.objects.all()
    serializer_class = InventoryConsumptionSerializer
#reservations/views.py
from rest_framework import generics
from .models import Reservation, ReservationItem
from .serializers import ReservationSerializer, ReservationItemSerializer

class ReservationListCreateView(generics.ListCreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    
class ReservationItemCreateView(generics.CreateAPIView):
    queryset = ReservationItem.objects.all()
    serializer_class = ReservationItemSerializer

class ReservationItemListView(generics.ListAPIView):
    queryset = ReservationItem.objects.all()
    serializer_class = ReservationItemSerializer
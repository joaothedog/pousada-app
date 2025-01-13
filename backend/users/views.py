#users/views.py
from rest_framework import generics
from .models import Guest
from .serializers import GuestSerializer

class GuestListCreateView(generics.ListCreateAPIView):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
    
class GuestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import Guest
from rooms.models import Room
from .models import Reservation

class ReservationAPITestCase(APITestCase):
    def setUp(self):
        self.guest = Guest.objects.create(name="John Doe", cpf="12345678901", phone="123456789")
        self.room = Room.objects.create(name="Quarto Simples", room_type="SIMPLES", capacity=1, daily_rate=100.00)
        self.reservation_data = {
            "guest": self.guest.id,
            "room": self.room.id,
            "check_in": "2025-01-10",
            "check_out": "2025-01-15",
            "payment_status": "PENDENTE",
            "total_price": 500.00
        }

    def test_create_reservation(self):
        response = self.client.post("/api/reservations/", self.reservation_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
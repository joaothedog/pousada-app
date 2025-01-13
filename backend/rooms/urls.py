# rooms/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.RoomListCreateView.as_view(), name="room-list-create"),
    path("<int:pk>/", views.RoomDetailView.as_view(), name="room-detail"),
    path("available/", views.AvailableRoomsView.as_view(), name="available-rooms"),
]

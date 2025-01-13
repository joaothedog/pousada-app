#reservations/urls.py
from django.urls import path
from .views import ReservationListCreateView, ReservationDetailView, ReservationItemListView, ReservationItemCreateView

urlpatterns = [
    path('', ReservationListCreateView.as_view(), name='reservation-list-create'),
    path('<int:pk>/', ReservationDetailView.as_view(), name='reservation-details'),
    path('items/', ReservationItemListView.as_view(), name='reservation-item-list'),
    path('items/add/', ReservationItemCreateView.as_view(), name='reservation-item-create'),
]
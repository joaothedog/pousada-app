#inventory/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.InventoryItemListCreateView.as_view(), name='inventory-item-list-create'),
    path('<int:pk>/', views.InventoryItemDetailView.as_view(), name='inventory-item-detail')
]

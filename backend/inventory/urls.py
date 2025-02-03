#inventory/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.InventoryItemListCreateView.as_view(), name='inventory-item-list-create'),
    path('<int:pk>/', views.InventoryItemDetailView.as_view(), name='inventory-item-detail'),

    path('inventory-consumptions/', views.InventoryConsumptionListCreateView.as_view(), name='inventory-consumption-list-create'),
    path('inventory-consumptions/<int:pk>/', views.InventoryConsumptionDetailView.as_view(), name='inventory-consumption-detail'),
]
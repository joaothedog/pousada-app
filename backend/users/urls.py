#users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.GuestListCreateView.as_view(), name='guest-list-create'),
    path('<int:pk>/', views.GuestDetailView.as_view(), name='guest-detail'),
]

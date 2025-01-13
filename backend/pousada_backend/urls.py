from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/rooms/', include('rooms.urls')),
    path('api/reservations/', include('reservations.urls')),
    path('api/inventory/', include('inventory.urls')),
]

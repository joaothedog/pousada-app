from django.contrib import admin
from .models import Room

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'room_type', 'capacity', 'daily_rate', 'is_available')
    list_filter = ('room_type', 'is_available')
    search_fields = ('name',)
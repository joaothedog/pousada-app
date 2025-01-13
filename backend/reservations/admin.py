from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('guest', 'room', 'check_in', 'check_out', 'payment_status', 'total_price')
    list_filter = ('payment_status', 'check_in', 'check_out')
    search_fields = ('guest__name', 'room__name')
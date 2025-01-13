from django.contrib import admin
from .models import InventoryItem

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'quantity', 'price')
    list_filter = ('location',)
    search_fields = ('name',)

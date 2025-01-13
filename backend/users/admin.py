from django.contrib import admin
from .models import Guest

@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ('name', 'cpf', 'phone', 'email')
    search_fields = ('name', 'cpf', 'phone', 'email')

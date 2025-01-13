from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import date


class Reservation(models.Model):
    STATUS_CHOICES = [
        ("CONFIRMADA", "Confirmada"),
        ("PENDENTE", "Pendente"),
        ("CANCELADA", "Cancelada"),
    ]

    guest = models.ForeignKey("users.Guest", on_delete=models.CASCADE)
    room = models.ForeignKey("rooms.Room", on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    payment_status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="PENDENTE"
    )
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    extra_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    extra_details = models.TextField(
        blank=True, null=True
    )  # Para registrar detalhes dos itens consumidos
    

    def delete(self, *args, **kwargs):
        # devolve a disponibilidade do quarto
        if self.room:
            self.room.is_available = True
            self.room.save()
        super().delete(*args, **kwargs)


    def save(self, *args, **kwargs):
        if self.check_in < date.today():
            raise ValidationError("A data de check-in deve ser a partir de hoje ou uma data futura.")

        overlapping_reservation = Reservation.objects.filter(
            room=self.room,
            check_in__lt=self.check_out,
            check_out__gt=self.check_in
        ).exclude(pk=self.pk).exists()  # Exclui a reserva atual se for edição

        if overlapping_reservation:
            raise ValidationError("O quarto já está reservado para esse período.")

        # Calcula o preço total
        total_days = (self.check_out - self.check_in).days
        room_price = total_days * self.room.daily_rate if total_days > 0 else 0
        self.total_price = room_price + Decimal(self.extra_charges)

        # Atualiza a disponibilidade do quarto
        self.room.is_available = False
        self.room.save()

        super().save(*args, **kwargs)


    def __str__(self):
        return f"Reserva de {self.guest.name} no quarto {self.room.name} ({self.check_in} a {self.check_out})"


class ReservationItem(models.Model):
    reservation = models.ForeignKey(
        Reservation, on_delete=models.CASCADE, related_name="consumed_items"
    )
    item = models.ForeignKey("inventory.InventoryItem", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.item.price

        # Decrementa o estoque do item consumido
        if self.item.quantity < self.quantity:
            raise ValidationError(f"Estoque insuficiente para {self.item.name}.")
        self.item.quantity -= self.quantity
        self.item.save()

        # Atualiza os gastos extras da reserva
        self.reservation.extra_charges += self.total_price
        
        # Salva as alterações na reserva
        self.reservation.save()

        super().save(*args, **kwargs)


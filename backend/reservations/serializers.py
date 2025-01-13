from rest_framework import serializers
from .models import Reservation, ReservationItem
from users.models import Guest
from rooms.models import Room
from inventory.models import InventoryItem
from users.serializers import GuestSerializer
from rooms.serializers import RoomSerializer
from inventory.serializers import InventoryItemSerializer
from datetime import date


class ReservationItemSerializer(serializers.ModelSerializer):
    item_details = InventoryItemSerializer(source="item", read_only=True)
    item = serializers.PrimaryKeyRelatedField(queryset=InventoryItem.objects.all())

    class Meta:
        model = ReservationItem
        fields = [
            "id",
            "reservation",
            "item",
            "item_details",
            "quantity",
            "total_price",
        ]
        read_only_fields = ["total_price"]


class ReservationSerializer(serializers.ModelSerializer):
    # Para leitura: inclui detalhes do hóspede e do quarto
    guest_details = GuestSerializer(source="guest", read_only=True)
    room_details = RoomSerializer(source="room", read_only=True)

    # Para escrita: permite enviar os IDs de guest e room
    guest = serializers.PrimaryKeyRelatedField(queryset=Guest.objects.all())
    room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())

    consumed_items = ReservationItemSerializer(many=True, read_only=True)


    def validate(self, data):
        room = data["room"]
        check_in = data["check_in"]
        check_out = data["check_out"]

        if check_in < date.today():
            raise serializers.ValidationError(
                "A data de check-in deve ser a partir de hoje ou uma data futura."
            )

        # Exclui a reserva atual da verificação (caso seja uma edição)
        overlapping_reservations = Reservation.objects.filter(
            room=room, check_in__lt=check_out, check_out__gt=check_in
        )
        if self.instance:
            overlapping_reservations = overlapping_reservations.exclude(pk=self.instance.pk)

        if overlapping_reservations.exists():
            raise serializers.ValidationError(
                "O quarto já está reservado para esse período."
            )

        return data

    class Meta:
        model = Reservation
        fields = [
            "id",
            "guest",
            "guest_details",
            "room",
            "room_details",
            "check_in",
            "check_out",
            "payment_status",
            "total_price",
            "extra_charges",
            "extra_details",
            "consumed_items",
        ]

    def create(self, validated_data):
        # Criação da reserva com os dados validados
        return Reservation.objects.create(**validated_data)

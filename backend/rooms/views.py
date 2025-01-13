#rooms/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db.models import Q
from reservations.models import Reservation
from .models import Room
from .serializers import RoomSerializer
from datetime import datetime


class AvailableRoomsView(APIView):
    """
    Endpoint para listar quartos disponíveis com base no intervalo de check-in e check-out.
    """
    def get(self, request, *args, **kwargs):
        # Recuperar check_in e check_out dos parâmetros da URL
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')

        # Validar se as datas foram fornecidas
        if not check_in or not check_out:
            return Response(
                {"error": "Por favor, forneça as datas de check-in e check-out nos parâmetros."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Convertendo para o tipo Date para validação
            check_in_date = datetime.strptime(check_in, "%Y-%m-%d").date()
            check_out_date = datetime.strptime(check_out, "%Y-%m-%d").date()

            # Verificar se as datas são no futuro
            if check_in_date < datetime.today().date() or check_out_date < datetime.today().date():
                return Response(
                    {"error": "As datas de check-in e check-out devem ser no futuro."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Buscar reservas que conflitam com as datas fornecidas
            reserved_rooms = Reservation.objects.filter(
                Q(check_in__lt=check_out_date) & Q(check_out__gt=check_in_date)
            ).values_list('room_id', flat=True)

            # Filtrar quartos que NÃO estão reservados
            available_rooms = Room.objects.exclude(id__in=reserved_rooms)

            # Serializar os quartos disponíveis
            serializer = RoomSerializer(available_rooms, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ValueError:
            return Response(
                {"error": "Formato de data inválido. Por favor, use o formato YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": f"Ocorreu um erro ao buscar quartos disponíveis: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RoomListCreateView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    

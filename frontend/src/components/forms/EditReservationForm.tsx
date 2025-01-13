import React, { useEffect, useState } from 'react';
import { getRooms, getReservationById, updateReservation } from '../../services/api';
import { Reservation, Room } from '../../types/types';
import { AxiosResponse } from 'axios';

interface EditReservationFormProps {
    reservationId: number;
    onClose: () => void;
    onReservationUpdated: (updatedReservation: Reservation) => void;
}

const EditReservationForm: React.FC<EditReservationFormProps> = ({
    reservationId,
    onClose,
    onReservationUpdated,
}) => {
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [checkInDate, setCheckInDate] = useState<string>('');
    const [checkOutDate, setCheckOutDate] = useState<string>('');
    const [selectedRoom, setSelectedRoom] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchReservationData = async () => {
            try {
                setLoading(true);

                const reservationResponse: AxiosResponse<Reservation> = await getReservationById(reservationId);
                const reservationData = reservationResponse.data;

                setReservation(reservationData);
                setCheckInDate(reservationData.check_in);
                setCheckOutDate(reservationData.check_out);
                setSelectedRoom(reservationData.room.id);

                const roomsData = await getRooms();
                setRooms(roomsData);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                alert('Erro ao carregar dados da reserva ou quartos.');
            } finally {
                setLoading(false);
            }
        };

        fetchReservationData();
    }, [reservationId]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!reservation) {
            alert('Dados da reserva ainda não carregados.');
            return;
        }

        const payload = {
            room: selectedRoom,
            check_in: checkInDate,
            check_out: checkOutDate,
            guest: reservation.guest || null
        };

        try {
            const updatedReservation = await updateReservation(reservationId, payload);
            onReservationUpdated(updatedReservation);
            onClose();
            alert('Reserva atualizada com sucesso!');
        } catch (error: any) {
            console.error('Erro ao atualizar reserva:', error.response || error.message);
            alert(error.response?.data?.detail || 'Erro ao atualizar reserva.');
        }
    };

    if (loading) {
        return <div>Carregando dados da reserva...</div>;
    }

    if (!reservation) {
        return <div>Erro ao carregar os dados da reserva.</div>;
    }

    return (
        <div>
            <h2>Editar Reserva</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="room">Quarto:</label>
                    <select
                        id="room"
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(Number(e.target.value))}
                    >
                        <option value="" disabled>
                            Selecione um quarto
                        </option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name} - {room.room_type} - R${room.daily_rate}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="check_in">Data de Check-in:</label>
                    <input
                        type="date"
                        id="check_in"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="check_out">Data de Check-out:</label>
                    <input
                        type="date"
                        id="check_out"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                    />
                </div>

                <button type="submit">Atualizar Reserva</button>
            </form>
            <button onClick={onClose}>Fechar</button>
        </div>
    );
};

export default EditReservationForm;

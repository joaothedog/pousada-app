import React, { useEffect, useState } from 'react';
import { getReservations, getGuests, getRooms, deleteReservation } from '../../services/api';
import { Reservation, Guest, Room, ReservationItem } from '../../types/types';
import EditReservationForm from './../forms/EditReservationForm';
import AddConsumptionForm from './../forms/AddConsumptionForm'; // Importe o AddConsumptionForm

const ReservationTable: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingReservationId, setEditingReservationId] = useState<number | null>(null);
    const [isAddingConsumption, setIsAddingConsumption] = useState<boolean>(false); // Controle para exibir o formulário de consumo
    const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null); // Reserva selecionada

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reservationsData, guestsData, roomsData] = await Promise.all([
                    getReservations(),
                    getGuests(),
                    getRooms(),
                ]);
                setReservations(reservationsData);
                setGuests(guestsData);
                setRooms(roomsData);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        };
        fetchData();
    }, []);

    const resolveGuestName = (guestId: number) => {
        const guest = guests.find((g) => g.id === guestId);
        return guest ? guest.name : 'Desconhecido';
    };

    const resolveRoomName = (roomId: number) => {
        const room = rooms.find((r) => r.id === roomId);
        return room ? room.name : 'Desconhecido';
    };

    const handleEdit = (reservationId: number) => {
        setEditingReservationId(reservationId);
        setIsEditing(true);
    };

    const handleReservationUpdated = (updatedReservation: Reservation) => {
        setReservations((prevReservations) =>
            prevReservations.map((reservation) =>
                reservation.id === updatedReservation.id ? updatedReservation : reservation
            )
        );
        handleCloseEdit();
    };

    const handleDelete = async (reservationId: number) => {
        try {
            await deleteReservation(reservationId);
            setReservations((prev) => prev.filter((res) => res.id !== reservationId));
            alert('Reserva excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir reserva:', error);
            alert('Erro ao excluir reserva!');
        }
    };

    const handleCloseEdit = () => {
        setIsEditing(false);
    };

    const handleAddConsumption = (reservationId: number) => {
        setSelectedReservationId(reservationId);
        setIsAddingConsumption(true);
    };

    const handleCloseConsumptionForm = () => {
        setIsAddingConsumption(false);
        setSelectedReservationId(null);
    };

    const handleItemsAdded = (updatedItems: ReservationItem[]) => {
        // Aqui você pode atualizar a lista de itens consumidos com os novos itens
        setReservations((prevReservations) =>
            prevReservations.map((reservation) =>
                reservation.id === editingReservationId
                    ? { ...reservation, consumed_items: updatedItems }
                    : reservation
            )
        );
    };

    return (
        <div>
            <table border={1} style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome do Convidado</th>
                        <th>Quarto</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Status do Pagamento</th>
                        <th>Preço Total</th>
                        <th>Gastos Extras</th>
                        <th>Detalhes Extras</th>
                        <th>Itens Consumidos</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.length > 0 ? (
                        reservations.map((reservation) => (
                            <tr key={reservation.id}>
                                <td>{reservation.id}</td>
                                <td>{resolveGuestName(reservation.guest as unknown as number)}</td>
                                <td>{resolveRoomName(reservation.room as unknown as number)}</td>
                                <td>{reservation.check_in}</td>
                                <td>{reservation.check_out}</td>
                                <td>{reservation.payment_status}</td>
                                <td>{reservation.total_price ? `R$ ${reservation.total_price}` : 'N/A'}</td>
                                <td>{reservation.extra_charges ? `R$ ${reservation.extra_charges}` : 'R$ 0,00'}</td>
                                <td>{reservation.extra_details || 'Sem Detalhes'}</td>
                                <td>
                                    {reservation.consumed_items && reservation.consumed_items.length > 0 ? (
                                        <ul>
                                            {reservation.consumed_items.map((item) => (
                                                <li key={item.id}>
                                                    {item.item_details.name} - {item.quantity} x {item.item_details.price} = R$ {item.total_price}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'Nenhum item consumido'
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(reservation.id)}>Editar</button>
                                    <button onClick={() => handleDelete(reservation.id)}>Excluir</button>
                                    <button onClick={() => handleAddConsumption(reservation.id)}>Consumo</button> {/* Botão "Consumo" */}
                                </td>
                            </tr>
                        ))) : (
                        <tr>
                            <td colSpan={6}>Nenhuma reserva encontrada.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isEditing && editingReservationId && (
                <EditReservationForm reservationId={editingReservationId} onClose={handleCloseEdit} onReservationUpdated={handleReservationUpdated} />
            )}

            {isAddingConsumption && selectedReservationId && (
                <AddConsumptionForm
                    onClose={handleCloseConsumptionForm}
                    reservationId={selectedReservationId}
                    onItemsAdded={handleItemsAdded}
                />
            )}

        </div>
    );
};

export default ReservationTable;

import React, { useEffect, useState } from 'react';
import { createReservation, getRooms, createGuest } from '../../services/api'; // Importe o createGuest
import { Reservation, Room, Guest } from '../../types/types'; // Importe o tipo Guest

const ReservationForm: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reservationData, setReservationData] = useState<Reservation>({
        id: 0,
        guest: { id: 0, name: '', cpf: '', phone: '', email: '' },
        room: { id: 0, room_type: 'SIMPLES', name: '', capacity: 0, daily_rate: 0, is_available: true },
        guest_details: { id: 0, name: '', cpf: '', phone: '', email: '' },
        room_details: { id: 0, room_type: 'SIMPLES', name: '', capacity: 0, daily_rate: 0, is_available: true },
        check_in: '',
        check_out: '',
        payment_status: 'PENDENTE',
        total_price: null,
        extra_charges: 0,
        extra_details: '',
        consumed_items: [],
    });

    const currentDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const roomsData = await getRooms();
                setRooms(roomsData);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        };

        fetchRooms();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        // Verifica se o campo é do tipo guest ou room
        if (name.startsWith('guest.')) {
            const guestKey = name.split('.')[1]; // Ex: name, cpf, phone
            setReservationData((prevData) => ({
                ...prevData,
                guest: { ...prevData.guest, [guestKey]: value },
            }));
        } else if (name === 'room') {
            const selectedRoom = rooms.find((room) => room.id === parseInt(value))!;
            setReservationData((prevData) => ({
                ...prevData,
                room: selectedRoom,
            }));
        } else {
            setReservationData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Primeiro, cria o hóspede
        try {
            let guestId = reservationData.guest.id;

            if (guestId === 0) { // Se o hóspede não existe (id 0), cria um novo
                const guestPayload: Guest = {
                    name: reservationData.guest.name,
                    cpf: reservationData.guest.cpf,
                    phone: reservationData.guest.phone,
                    email: reservationData.guest.email,
                    id: reservationData.guest.id
                };

                const guestResponse = await createGuest(guestPayload); // Cria o hóspede
                guestId = guestResponse.data.id; // Obtém o ID do hóspede criado
            }

            // Após criar o hóspede, cria a reserva
            const reservationPayload = {
                ...reservationData,
                guest: guestId, // Passa o ID do hóspede
                room: reservationData.room.id, // Passa o ID do quarto
            };

            const reservationResponse = await createReservation(reservationPayload); // Cria a reserva
            console.log('Reserva criada com sucesso:', reservationResponse.data);
            alert('Reserva criada com sucesso!');
        } catch (error) {
            console.error('Erro ao criar reserva ou hóspede:', error);
            alert('Erro ao criar reserva ou hóspede! Verifique os dados.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Criar Reserva</h1>

            {/* Dados do hóspede */}
            <div>
                <label>Nome do Hóspede:</label>
                <input
                    type="text"
                    name="guest.name"
                    value={reservationData.guest.name}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div>
                <label>CPF:</label>
                <input
                    type="text"
                    name="guest.cpf"
                    value={reservationData.guest.cpf}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div>
                <label>Telefone:</label>
                <input
                    type="text"
                    name="guest.phone"
                    value={reservationData.guest.phone}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    name="guest.email"
                    value={reservationData.guest.email}
                    onChange={handleInputChange}
                    required
                />
            </div>

            {/* Dados da reserva */}
            <div>
                <label>Quarto:</label>
                <select
                    name="room"
                    value={reservationData.room.id}
                    onChange={handleInputChange}
                >
                    <option value={0}>Selecione um quarto</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.name} ({room.room_type})
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Data de Check-in:</label>
                <input
                    type="date"
                    name="check_in"
                    value={reservationData.check_in}
                    onChange={handleInputChange}
                    required
                    min={currentDate}
                />
            </div>
            <div>
                <label>Data de Check-out:</label>
                <input
                    type="date"
                    name="check_out"
                    value={reservationData.check_out}
                    onChange={handleInputChange}
                    required
                    min={reservationData.check_in === '' ? currentDate : reservationData.check_in}
                />
            </div>
            <div>
                <label>Status do Pagamento:</label>
                <select
                    name="payment_status"
                    value={reservationData.payment_status}
                    onChange={handleInputChange}
                >
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="CANCELADA">Cancelada</option>
                </select>
            </div>
            <div>
                <label>Gastos Extras:</label>
                <input
                    type="number"
                    name="extra_charges"
                    value={reservationData.extra_charges || 0}
                    onChange={handleInputChange}
                    step="0.01"
                />
            </div>
            <div>
                <label>Detalhes Extras:</label>
                <textarea
                    name="extra_details"
                    value={reservationData.extra_details || ''}
                    onChange={handleInputChange}
                />
            </div>

            <button type="submit">Criar Reserva</button>
        </form>
    );
};

export default ReservationForm;

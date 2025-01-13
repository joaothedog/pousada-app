import React, { useEffect, useState } from 'react';
import { deleteRoom, getRooms } from '../../services/api'
import { Room } from '../../types/types'

const RoomTable: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data)
            } catch (error) {
                console.error('Erro ao buscar quartos: ', error)
            }
        };
        fetchRooms();
    }, [])

    const handleDelete = async (roomId: number) => {
        try {
            await deleteRoom(roomId);
            setRooms((prev) => prev.filter((res) => res.id !== roomId));
            alert('Hóspede excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir Hóspede:', error);
            alert('Erro ao excluir Hóspede!');
        }
    };


    return (
        <table border={1} style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th>Nome do quarto</th>
                    <th>Tipo</th>
                    <th>Capacidade</th>
                    <th>Diária</th>
                    <th>Disponível</th>
                </tr>
            </thead>
            <tbody>
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <tr key={room.id}>
                            <td>{room.name}</td>
                            <td>{room.room_type}</td>
                            <td>{room.capacity} pessoas</td>
                            <td>{room.daily_rate}</td>
                            <td>{room.is_available ? 'Sim' : 'Não'}</td>
                            <td>
                                <button onClick={() => handleDelete(room.id)}>Excluir</button>
                            </td>
                        </tr>

                    ))) : (
                    <tr>
                        <td colSpan={6}>Nenhum quarto encontrado.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default RoomTable;

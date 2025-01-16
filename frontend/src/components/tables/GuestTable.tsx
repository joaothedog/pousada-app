import React, { useEffect, useState } from 'react';
import { getGuests, deleteGuest } from '../../services/api';
import { Guest } from '../../types/types';

const GuestTable: React.FC = () => {
    const [guests, setGuests] = useState<Guest[]>([]);

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const data = await getGuests();
                setGuests(data);
            } catch (error) {
                console.error("Erro ao buscar convidados:", error);
            }
        };
        fetchGuests();
    }, []);

    const handleDelete = async (guestId: number) => {
        try {
            await deleteGuest(guestId);
            setGuests((prev) => prev.filter((res) => res.id !== guestId));
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
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {guests.length > 0 ? (
                    guests.map((guest) => (
                        <tr key={guest.id}>
                            <td>{guest.name}</td>
                            <td>{guest.cpf}</td>
                            <td>{guest.phone}</td>
                            <td>{guest.email || 'N/A'}</td>
                            <td>
                                <button onClick={() => handleDelete(guest.id)}>Excluir</button>
                            </td>
                        </tr>
                    ))) : (
                    <tr>
                        <td colSpan={6}>Nenhum hóspede encontrado.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default GuestTable;



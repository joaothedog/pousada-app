import React, { useState } from 'react';
import { createRoom } from '../../services/api'; 

const RoomForm: React.FC = () => {
    const [formData, setFormData] = useState({
        room_type: 'SIMPLES',
        name: '',
        capacity: 1,
        daily_rate: 0,
        is_available: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRoom(formData);
            alert('Quarto criado com sucesso!');
            setFormData({
                room_type: 'SIMPLES',
                name: '',
                capacity: 1,
                daily_rate: 0,
                is_available: true,
            });
        } catch (error) {
            console.error(error);
            alert('Erro ao criar o quarto. Por favor, tente novamente.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>
                Tipo de Quarto:
                <select name="room_type" value={formData.room_type} onChange={handleChange}>
                    <option value="SIMPLES">Simples</option>
                    <option value="DUPLO">Duplo</option>
                    <option value="LUXO">Luxo</option>
                </select>
            </label>

            <label>
                Nome do Quarto:
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex.: Quarto 101"
                    required
                />
            </label>

            <label>
                Capacidade:
                <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    placeholder="Ex.: 2"
                    required
                />
            </label>

            <label>
                Taxa Diária (R$):
                <input
                    type="number"
                    name="daily_rate"
                    value={formData.daily_rate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Ex.: 150.00"
                    required
                />
            </label>

            <label>
                Disponível:
                <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                />
            </label>

            <button type="submit">Cadastrar Quarto</button>
        </form>
    );
};

export default RoomForm;

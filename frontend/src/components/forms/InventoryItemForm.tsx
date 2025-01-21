import React, { useState } from 'react';
import { createInventoryItem } from '../../services/api'; // Assuma que esta função realiza o POST na API

const InventoryItemForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        location: 'RECEPCAO',
        quantity: 0,
        price: 0.0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createInventoryItem(formData);
            alert('Item de inventário criado com sucesso!');
            setFormData({
                name: '',
                location: 'RECEPCAO',
                quantity: 0,
                price: 0.0,
            });
        } catch (error) {
            console.error(error);
            alert('Erro ao criar o item de inventário. Por favor, tente novamente.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>
                Nome do Item:
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex.: Cadeira de Escritório"
                    required
                />
            </label>

            <label>
                Localização:
                <select name="location" value={formData.location} onChange={handleChange}>
                    <option value="RECEPCAO">Recepção</option>
                    <option value="COZINHA">Cozinha</option>
                </select>
            </label>

            <label>
                Quantidade:
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    placeholder="Ex.: 10"
                    required
                />
            </label>

            <label>
                Preço Unitário (R$):
                <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Ex.: 50.00"
                    required
                />
            </label>

            <button type="submit">Cadastrar Item</button>
        </form>
    );
};

export default InventoryItemForm;



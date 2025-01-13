import React, { useState } from 'react';
import { createGuest } from '../../services/api';

const GuestForm: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', cpf: '', phone: '', email: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createGuest(formData);
        alert('Hóspede criado com sucesso!');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Nome" onChange={handleChange} />
            <input name="cpf" placeholder="CPF" onChange={handleChange} />
            <input name="phone" placeholder="Telefone" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <button type="submit">Cadastrar</button>
        </form>
    );
};

export default GuestForm;

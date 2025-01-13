import React from 'react';
import GuestTable from '../components/tables/GuestTable';
import GuestForm from '../components/forms/GuestForm';

const GuestsPage: React.FC = () => (
    <div>
        <h1>Hóspedes</h1>
        <GuestForm />
        <GuestTable />
    </div>
);

export default GuestsPage;

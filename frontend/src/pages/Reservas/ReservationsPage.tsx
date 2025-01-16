import React from 'react';
import ReservationForm from '../../components/forms/ReservationForm';
import ReservationTable from '../../components/tables/ReservationTable';


const ReservationsPage: React.FC = () => (
    <div>
        <h1>Reservas</h1>
        <ReservationForm />
        <ReservationTable />
    </div>
);

export default ReservationsPage;

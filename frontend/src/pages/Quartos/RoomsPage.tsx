import React from 'react';
import RoomTable from '../../components/tables/RoomTable';
import RoomForm from '../../components/forms/RoomForm';

const RoomsPage: React.FC = () => (
    <div>
        <h1>Quartos</h1>
        <RoomForm />
        <RoomTable />
    </div>
);

export default RoomsPage;

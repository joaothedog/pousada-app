import React from 'react';
import InventoryItemForm from '../../components/forms/InventoryItemForm';
import InventoryTable from '../../components/tables/InventoryTable';

const InventoryPage: React.FC = () => (
    <div>
        <h1>Estoque</h1>
        <InventoryItemForm/>
        <InventoryTable />
    </div>
);

export default InventoryPage;

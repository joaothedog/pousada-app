import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from '../pages/Dashboard';
import GuestsPage from '../pages/GuestsPage';
import RoomsPage from '../pages/RoomsPage';
import ReservationsPage from '../pages/ReservationsPage';
import InventoryPage from '../pages/InventoryPage';

const AppRouter: React.FC = () => (
    <Router>
        <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/guests" element={<GuestsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
        </Routes>
    </Router>
);

export default AppRouter;

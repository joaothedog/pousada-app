import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from '../pages/Dashboard';
import GuestsPage from '../pages/Hospedes/GuestsPage';
import RoomsPage from '../pages/Quartos/RoomsPage';
import ReservationsPage from '../pages/Reservas/ReservationsPage';
import InventoryPage from '../pages/estoque/InventoryPage';
import { AdminHome } from '../pages/AdminHome';
import { Provider } from 'react-redux'; // Importa o Provider do Redux
import stores from '../stores/stores'; // Importa a store configurada

const AppRouter: React.FC = () => (

    <Provider store={stores}>
    {/* Envolvendo o app inteiro com o Provider */}
    <Router>
        <Routes>
             <Route path="/" element={<AdminHome />} />
            <Route path="/guests" element={<GuestsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
        </Routes>
    </Router>
  </Provider>
  
 
 
   
);

export default AppRouter;

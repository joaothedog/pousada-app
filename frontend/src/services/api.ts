import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Guest, Room, Reservation, InventoryItem } from '../types/types';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Substitua pelo endpoint correto do seu backend
});


// Inventory Endpoints
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
    const response: AxiosResponse<InventoryItem[]> = await api.get('/inventory/');
    return response.data;
};
export const createInventoryItem = (data: any) => api.post('/inventory/', data);
export const getInventoryItemById = (id: number) => api.get(`/inventory/${id}/`);
export const updateInventoryItem = (id: number, data: any) => api.put(`/inventory/${id}/`, data);
export const deleteInventoryItem = (id: number) => api.delete(`/inventory/${id}/`);




// Inventory Consumption Endpoints
export const getInventoryConsumptions = async () => {
    const response: AxiosResponse<any[]> = await api.get('/inventory/inventory-consumptions/');
    return response.data;
};
export const createInventoryConsumption = (data: any) => api.post('/inventory/inventory-consumptions/', data);
export const getInventoryConsumptionById = (id: number) => api.get(`/inventory/inventory-consumptions/${id}/`);
export const updateInventoryConsumption = (id: number, data: any) => api.put(`/inventory/inventory-consumptions/${id}/`, data);
export const deleteInventoryConsumption = (id: number) => api.delete(`/inventory/inventory-consumptions/${id}/`);


// Reservations Endpoints
export const getReservations = async (): Promise<Reservation[]> => {
    const response: AxiosResponse<Reservation[]> = await api.get('/reservations/');
    return response.data;
};
export const createReservation = (data: any) => {
    return api.post('/reservations/', data)
        .then(response => {
            return response.data; // Retorna os dados da resposta em caso de sucesso
        })
        .catch(error => {
            console.error("Erro na chamada da API:", error);
            throw error; // Re-lança o erro para ser tratado no handleSubmit
        });
};
export const getReservationById = (id: number) => api.get(`/reservations/${id}/`);
export const updateReservation = async (id: number, data: any) => {
    try {
        const response = await api.put(`/reservations/${id}/`, data);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao atualizar reserva:", error.response || error.message);
        throw error;
    }
};
export const deleteReservation = (id: number) => api.delete(`/reservations/${id}/`);

export const getReservationItems = () => api.get('/reservations/items/');
export const createReservationItem = (data: any) => api.post('/reservations/items/add/', data);

// Rooms Endpoints
export const getRooms = async (): Promise<Room[]> => {
    const response: AxiosResponse<Room[]> = await api.get('/rooms/');
    return response.data;
};
export const createRoom = (data: any) => api.post('/rooms/', data);
export const getRoomById = (id: number) => api.get(`/rooms/${id}/`);
export const updateRoom = (id: number, data: any) => api.put(`/rooms/${id}/`, data);
export const deleteRoom = (id: number) => api.delete(`/rooms/${id}/`);

// Users (Guests) Endpoints
export const getGuests = async (): Promise<Guest[]> => {
    const response: AxiosResponse<Guest[]> = await api.get('/users/');
    return response.data;
};
export const createGuest = (data: any) => api.post('/users/', data);
export const getGuestById = (id: number) => api.get(`/users/${id}/`);
export const updateGuest = (id: number, data: any) => api.put(`/users/${id}/`, data);
export const deleteGuest = (id: number) => api.delete(`/users/${id}/`);

export default api;

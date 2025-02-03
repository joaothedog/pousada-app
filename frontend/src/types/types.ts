export interface Room {
    id: number;
    room_type: 'SIMPLES' | 'DUPLO' | 'TRIPLO'|"QUADRUPLO"|"QUINTUPLO"|"SEXTUPLO";
    name: string;
    capacity: number;
    daily_rate: number;
    is_available: boolean;
}

export interface Guest {
    id: number;
    name: string;
    cpf: string;
    phone: string;
    email?: string;
}

export interface InventoryItem {
    id: number;
    name: string;
    location: 'RECEPCAO' | 'COZINHA';
    quantity: number;
    price: number;
}

export type PaymentStatus =  'CONFIRMADA' | 'PENDENTE' | 'CANCELADA';

export interface Reservation {
    id: number;
    guest: Guest; // Objeto completo de hóspede
    room: Room;   // Objeto completo de quarto
    guest_details: Guest;  // Detalhes do hóspede, se necessário para renderizar
    room_details: Room;    // Detalhes do quarto, se necessário para renderizar
    check_in: string;
    check_out: string;
    payment_status: PaymentStatus;
    total_price: number | null;
    extra_charges: number;
    extra_details?: string;
    consumed_items?: ReservationItem[];
}

export interface ReservationItem {
    id: number;
    reservation: Reservation; // Referência à reserva associada
    item: InventoryItem;      // Referência ao item do inventário consumido
    item_details: InventoryItem;
    quantity: number;         // Quantidade consumida
    total_price: number;      // Preço total do item consumido
}

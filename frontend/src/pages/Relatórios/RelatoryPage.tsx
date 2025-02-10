import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { SidebarComponent } from '../../components/sidebar';
import { getReservations, getGuests, getRooms } from '../../services/api'; 
import './styles.css';
import { VscArrowCircleRight } from "react-icons/vsc";
import { VscArrowCircleLeft } from "react-icons/vsc";
import  '../Reservas/ReservationsPage';





export interface Reservation {
  id: number;
  guest: number | { id: number; name: string; cpf: string; phone: string; email: string };
  room: number | { id: number; room_type: string; name: string; capacity: number; cooling_type: string; is_available: boolean };
  check_in: string;
  check_out: string;
  payment_status: "CONFIRMADA" | "CANCELADA" | "PENDENTE";
  total_price: number | null;
  extra_charges: number;
  extra_details: string;
  consumed_items: { id: number; name: string; price: number }[];
  daily_rate: number;
  number_of_children: number;
  number_of_guests: number;
}

interface Guest {
  id: number;
  name: string;
}

interface Room {
  id: number;
  name: string;
}

export function RelatoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');


 
// usado para carregar os dados ao entrar na página
  useEffect(() => {
    carregarReservas();
    carregarHospedes();
    carregarQuartos();
  }, []);

  const carregarReservas = async () => {
    setLoading(true);
    try {
        const data = await getReservations();
        const reservations: Reservation[] = data.map((item: any) => ({
            id: item.id,
            guest: item.guest,
            room: item.room,
            check_in: new Date(item.check_in + "T12:00:00").toLocaleDateString('pt-BR'),
            check_out: new Date(item.check_out + "T12:00:00").toLocaleDateString('pt-BR'),
            payment_status: item.payment_status ?? "PENDENTE", // Definir padrão
            total_price: item.total_price ?? 0,
            daily_rate: item.daily_rate ?? 0, // Adicionado para garantir cálculo correto
            number_of_guests: item.number_of_guests ?? 1, // Definir padrão caso seja nulo
            number_of_children: item.number_of_children ?? 0, // Definir padrão caso seja nulo
            extra_charges: item.extra_charges ?? 0, // Adicionado
            extra_details: item.extra_details ?? "", // Adicionado para evitar erro
            consumed_items: item.consumed_items ?? [], // Certificar que a lista não seja undefined
        }));

        setReservations(reservations);
        setFilteredReservations(reservations); // Define os dados iniciais filtrados
    } catch (error) {
        console.error("Erro ao carregar reservas:", error);
    } finally {
        setLoading(false);
    }
};


  const carregarHospedes = async () => {
    try {
      const data = await getGuests();
      setGuests(data);
    } catch (error) {
      console.error('Erro ao carregar hóspedes:', error);
    }
  };

  const carregarQuartos = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
    }
  };

  const getGuestName = (guest: number | { id: number; name: string }) => {
    if (typeof guest === "number") {
        const foundGuest = guests.find((g) => g.id === guest);
        return foundGuest ? foundGuest.name : "Hóspede não encontrado";
    }
    return guest.name;
};

const getRoomName = (room: number | { id: number; name: string }) => {
  if (typeof room === "number") {
      const foundRoom = rooms.find((r) => r.id === room);
      return foundRoom ? foundRoom.name : "Quarto não encontrado";
  }
  return room.name;
};


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
  };

//usado para filtrar a buscar no searchterm
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReservations(reservations);
      return;
    }

    const filtered = reservations.filter((reservation) => {
      const guestName = getGuestName(reservation.guest).toLowerCase();
      const roomNumber = getRoomName(reservation.room).toLowerCase();
      const checkInDate = reservation.check_in.replace(/\//g, '-').toLowerCase();
      const searchQueryFormatted = searchQuery.replace(/\//g, '-').toLowerCase();
      
      return (
        guestName.includes(searchQuery.toLowerCase()) ||
        roomNumber.includes(searchQuery.toLowerCase()) ||
        checkInDate.includes(searchQueryFormatted)
      );
    });

    setFilteredReservations(filtered);
  }, [searchQuery, reservations, guests, rooms]);

  const resolveNumberOfGuests = (reservation: Reservation) => {
    return reservation ? reservation.number_of_guests : 1; 
};

const resolveNumberOfChildren = (reservation: Reservation) => {
    return reservation.number_of_children ?? 0; 
};




  return (
    <PageContainer padding="0px">
      <div style={{ height: "90%", width: "94.8%", marginTop: "10px", marginLeft: "10px" }}>
        <SidebarComponent />
      </div>

      <div className="content-1">
        <section className="cadastro-1-relatory">
          
          <h1 style={{ marginLeft: "1%" }}>Relatórios das Reservas</h1>
          <div className="search-bar">
            <input
            style={{width:"140%",marginLeft:"-20%"}}
              type="text"
              placeholder=" Buscar por Hóspede, quarto ou data..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          {loading ? (
            <p>Carregando reservas...</p>
          ) : (
            <>
              <ul className="reservation-list">
                {filteredReservations.map((reservation) => (
                  <li key={reservation.id} className="reservation-item">
                    <strong>Hóspede:</strong> {getGuestName(reservation.guest)} - 
                    <strong> Quarto:</strong> {getRoomName(reservation.room)} - 
                    <strong> Check-in:</strong> {reservation.check_in} - 
                    <strong> Check-out:</strong> {reservation.check_out} - 
                  </li>
                )).reverse()}
              </ul>

            
            </>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

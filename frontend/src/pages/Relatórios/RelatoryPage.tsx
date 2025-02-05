import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { SidebarComponent } from '../../components/sidebar';
import { getReservations, getGuests, getRooms } from '../../services/api'; 
import './styles.css';
import { VscArrowCircleRight } from "react-icons/vsc";
import { VscArrowCircleLeft } from "react-icons/vsc";

interface Reservation {
  id: number;
  guest: number;
  room: number;
  check_in: string;
  check_out: string;
  total_price: number | null;
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


  {/* // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 27; 
    //**Paginação (somente se não houver pesquisa ativa)**
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchQuery ? filteredReservations : filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  
    
    <div className="pagination">
    <VscArrowCircleLeft 
        className='pagina-relatory'
        onClick={() => setCurrentPage((prev) => prev - 1)}
        />
      <span style={{color:"ghostwhite"}}>--------</span>
      
      <VscArrowCircleRight 
        className='pagina-relatory'
        onClick={() => setCurrentPage((prev) => prev + 1)}
        />
      
    </div>
  */}
 

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
        total_price: item.total_price ?? 0,
      }));
      setReservations(reservations);
      setFilteredReservations(reservations); // Define os dados iniciais filtrados
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
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

  const getGuestName = (guestId: number): string => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.name : 'Hóspede não encontrado';
  };

  const getRoomName = (roomId: number): string => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : 'Quarto não encontrado';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
  };

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




  return (
    <PageContainer padding="0px">
      <div style={{ height: "90%", width: "94.8%", marginTop: "10px", marginLeft: "10px" }}>
        <SidebarComponent />
      </div>

      <div className="content-1">
        <section className="cadastro-1">
          
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
                    <strong> Total:</strong> R$ {typeof reservation.total_price === "number" 
                        ? reservation.total_price.toFixed(2) 
                        : "N/A"}
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

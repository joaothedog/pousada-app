import React, { useEffect, useState } from 'react';
import { getReservations, createReservation, deleteReservation, getRooms, createGuest, getGuests } from '../../services/api';
import { PageContainer } from '../../components/PageContainer';
import { SidebarComponent } from '../../components/sidebar/index';
import { Container, Containerr } from './styles';
import "./styles.css";
import { FaTrashAlt } from 'react-icons/fa';
import { CgDetailsMore } from "react-icons/cg";
import {  Guest, Room, ReservationItem, Reservation, InventoryItem } from '../../types/types';
import { createInventoryItem,getInventoryItems,updateReservation } from '../../services/api'; 
import AddConsumptionForm from '../../components/forms/AddConsumptionForm';
import { VscArrowCircleLeft, VscArrowCircleRight } from 'react-icons/vsc';







export function GerenciaReservas() {


    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]); // Tipando o estado corretamente como InventoryItem[]

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reservationData, setReservationData] = useState<Reservation>({
        id: 0,
        guest: { id: 0, name: '', cpf: '', phone: '', email: '' },
        room: { id: 0, room_type: 'SIMPLES', name: '', capacity: 0, daily_rate: 0, is_available: true },
        guest_details: { id: 0, name: '', cpf: '', phone: '', email: '' }, // Adicionado para evitar erro
        room_details: { id: 0, room_type: 'SIMPLES', name: '', capacity: 0, daily_rate: 0, is_available: true }, // Adicionado para evitar erro
        check_in: '',
        check_out: '',
        payment_status: 'CONFIRMADA',
        total_price: null,
        extra_charges: 0,
        extra_details: '',
        consumed_items: [],
    });
    
    
    
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [DetalhesSelecionados, setDetalhesSelecionados] = useState<any | null>(null);
    const currentDate = new Date().toISOString().split('T')[0];
    const [isAddingConsumption, setIsAddingConsumption] = useState<boolean>(false); 
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [itemQuantity, setItemQuantity] = useState<number>(1);
    const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null); // ID do hóspede selecionado
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;



    
   


  useEffect(() => {
    const fetchInventoryItems = async () => {
        try {
            const items = await getInventoryItems();
            const receptionItems = items.map((item) => ({
                ...item,
                price: typeof item.price === 'number' ? item.price : 0, 
            })).filter((item) => item.location === 'RECEPCAO');
            setInventoryItems(receptionItems);
        } catch (error) {
            console.error('Erro ao carregar itens do inventário:', error);
        }
    };

    fetchInventoryItems();
}, []);


 useEffect(() => {
        carregarDados();
    }, []);


    const carregarDados = async () => {
            setLoading(true);
            try {
                const data = await getReservations();
                setReservations(data);
                setFilteredReservations(data);
            } catch (error) {
                console.error('Erro ao carregar hóspedes:', error);
            } finally {
                setLoading(false);
            }
        };
   
       useEffect(() => {
           const fetchRooms = async () => {
               try {
                   const roomsData = await getRooms();
                   setRooms(roomsData);
               } catch (error) {
                   console.error('Erro ao carregar dados:', error);
               }
           };
   
           fetchRooms();
       }, []);
   
       const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
    
        if (name === "existingGuest") { // Quando o usuário escolhe um hóspede existente
            const selectedGuest = guests.find((guest) => guest.id === parseInt(value));
            setSelectedGuestId(parseInt(value) || null);
            if (selectedGuest) {
                setReservationData((prevData) => ({
                    ...prevData,
                    guest: { ...selectedGuest } // Preenche os campos automaticamente
                }));
            }
        } else if (name.startsWith("guest.")) { // Permite edição manual caso necessário
            const guestKey = name.split(".")[1];
            setReservationData((prevData) => ({
                ...prevData,
                guest: { ...prevData.guest, [guestKey]: value },
            }));
        } else if (name === "room") { // Seleção de quarto
            const selectedRoom = rooms.find((room) => room.id === parseInt(value));
            setReservationData((prevData) => ({
                ...prevData,
                room: selectedRoom || prevData.room,
            }));
        } else {
            setReservationData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        try {
            let guestId = selectedGuestId; // Se um hóspede existente foi selecionado, usa o ID dele
    
            if (!guestId) { // Se nenhum hóspede foi selecionado, cria um novo
                const guestResponse = await createGuest(reservationData.guest);
                guestId = guestResponse.data.id;
            }
    
            if (!guestId) {
                alert("Erro ao selecionar ou criar um hóspede.");
                return;
            }
    
            // Ajuste para garantir que as datas sejam enviadas corretamente
            const checkInDate = new Date(reservationData.check_in);
            checkInDate.setMinutes(checkInDate.getMinutes() + checkInDate.getTimezoneOffset());
    
            const checkOutDate = new Date(reservationData.check_out);
            checkOutDate.setMinutes(checkOutDate.getMinutes() + checkOutDate.getTimezoneOffset());
    
            const reservationPayload = {
                guest: guestId,
                room: reservationData.room.id,
                check_in: checkInDate.toISOString().split('T')[0], // Garantir que a data fique correta
                check_out: checkOutDate.toISOString().split('T')[0],
                payment_status: reservationData.payment_status,
                total_price: reservationData.total_price,
                extra_charges: reservationData.extra_charges,
                extra_details: reservationData.extra_details,
                consumed_items: [],
            };
    
            const newReservation = await createReservation(reservationPayload);
    
            setReservations((prev) => [newReservation, ...prev]);
            setFilteredReservations((prev) => [newReservation, ...prev]);
    
            alert("Reserva criada com sucesso!");
        } catch (error) {
            console.error("Erro ao criar reserva:", error);
            alert("Erro ao criar reserva! Verifique os dados.");
        }
    };
    
    
    
    



 useEffect(() => {
        const fetchData = async () => {
            try {
                const [reservationsData, guestsData, roomsData] = await Promise.all([
                    getReservations(),
                    getGuests(),
                    getRooms(),
                ]);
                setReservations(reservationsData);
                setGuests(guestsData);
                setRooms(roomsData);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        };
        fetchData();
    }, []);



   
    const handleFecharModal = () => {
        setDetalhesSelecionados(null); // fechar modal
    };
  
    const getGuestName = (guestId:any) => {
        const guest = guests.find((g) => g.id === guestId);
        return guest ? guest.name.toLowerCase() : '';
    };

    const getRoomName = (roomId:any) => {
        const room = rooms.find((r) => r.id === roomId);
        return room ? room.name.toLowerCase() : '';
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredReservations(reservations);
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        setFilteredReservations(
            reservations.filter((reservation) => {
                const guestName = getGuestName(reservation.guest);
                const roomNumber = getRoomName(reservation.room);
                const checkInDate = reservation.check_in.replace(/\//g, '-').toLowerCase();
                const formattedSearchTerm = searchTerm.replace(/\//g, '-').toLowerCase();
                
                return (
                    guestName.includes(searchLower) ||
                    roomNumber.includes(searchLower) ||
                    checkInDate.includes(formattedSearchTerm)
                );
            })
        );
    }, [searchTerm, reservations, guests, rooms]);
    
    

   
    const handleDelete = async (reservationId: number) => {
        try {
            // Encontre a reserva a ser excluída
            const reservationToDelete = reservations.find((res) => res.id === reservationId);
            if (!reservationToDelete) {
                alert('Reserva não encontrada!');
                return;
            }
    
            // Exclua a reserva
            await deleteReservation(reservationId);
    
            // Atualize o status do quarto para disponível
            const updatedRoom = {
                ...reservationToDelete.room,
                is_available: true,
            };
          
    
            // Atualize os estados locais
            setReservations((prev) => prev.filter((res) => res.id !== reservationId)); // Remove a reserva da lista
            setFilteredReservations((prev) => prev.filter((res) => res.id !== reservationId)); // Atualiza a lista filtrada
            setRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.id === updatedRoom.id ? updatedRoom : room
                )
            );
    
            alert('Reserva excluída com sucesso e quarto atualizado para disponível!');
        } catch (error) {
            console.error('Erro ao excluir reserva:', error);
            alert('Erro ao excluir reserva ou atualizar o quarto!');
        }
    };
    




// Funções para resolver dados do hóspede
const resolveGuestName = (guestId: number) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.name : 'Desconhecido';
};

const resolveGuestCPF = (guestId: number) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.cpf : 'Não informado';
};

const resolveGuestPhone = (guestId: number) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.phone : 'Não informado';
};

const resolveGuestEmail = (guestId: number) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.email : 'Não informado';
};

// Funções para resolver dados do quarto
const resolveRoomName = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : 'Desconhecido';
};

const resolveRoomType = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.room_type : 'Desconhecido';
};

const resolveRoomCapacity = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.capacity : 0;
};





  




    return (
        <PageContainer padding="0px">
            <div className="main2">
                <SidebarComponent />
                <div className="criar">
                    {/*Aba de cadastro dos cards das reservas */}
                    <h1>Cadastrar Reserva</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="cadastro">
                            <div className="row">
                            <div className="input" style={{marginLeft:"-50%",marginTop:"30%"}}>
                                    <label htmlFor="Guest">Hóspede  Existente:</label>
                                    <select 
                                     name="existingGuest" 
                                     value={selectedGuestId || ""}
                                     onChange={handleInputChange}
                                    
                                     style={{width:"110%",height:"30px"}}
                                     >
                                        <option value="">Selecione um Hóspede</option>
                                        {guests.map((guest) => (
                                            <option key={guest.id} value={guest.id} >
                                                {guest.name} 
                                            </option>
                                        ))}
                                    </select>
                                </div><br></br>
                                <div className="input" style={{marginLeft:"-50%"}}>
                                    <label htmlFor="guest.name">Nome do Hóspede:</label>
                                    <input
                                        type="text"
                                        name="guest.name"
                                        value={reservationData.guest.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                <div className="input" style={{marginLeft:"-50%"}}>
                                    <label htmlFor="guest.cpf">CPF:</label>
                                    <input
                                        type="text"
                                        name="guest.cpf"
                                        value={reservationData.guest.cpf}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                <div className="input" style={{marginLeft:"-50%"}}>
                                    <label htmlFor="guest.phone">Telefone:</label>
                                    <input
                                        placeholder='ex:(77)78898989'
                                        type="text"
                                        name="guest.phone"
                                        value={reservationData.guest.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                <div className="input" style={{marginLeft:"-50%"}}>
                                    <label htmlFor="guest.email">Email:</label>
                                    <input
                                        placeholder='ex:@email.com'
                                        type="text"
                                        name="guest.email"
                                        value={reservationData.guest.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                <div className="input" style={{marginLeft:"60%",marginTop:"-179.5%"}}>
                                    <label htmlFor="check_in">Data de Check-in:</label>
                                    <input
                                        type="date"
                                        name="check_in"
                                        value={reservationData.check_in}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                <div className="input" style={{marginLeft:"60%"}}>
                                    <label htmlFor="check_out">Data de Check-out:</label>
                                    <input
                                        type="date"
                                        name="check_out"
                                        value={reservationData.check_out}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                
                                <div className="input" style={{marginLeft:"60%"}}>
                                    <label htmlFor="room">Quarto:</label>
                                    <select
                                        name="room"
                                        value={reservationData.room.id}
                                        onChange={handleInputChange}
                                        required
                                        style={{width:"109%",height:"30px"}}
                                    >
                                        <option value="">Selecione um quarto</option>
                                        {rooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                {room.name} ({room.room_type})
                                            </option>
                                        ))}
                                    </select>
                                </div><br></br>
                                <div className="input" style={{ marginLeft: "60%" }}>
                               <label htmlFor="num_people">Pessoas No Quarto:</label>
                               <input
                                type="number"
                                name="num_people"
                                min="1"  
                            required
                            style={{ width: "100%", height: "17px" }}
                             />
                              {/*max={reservationData.room.capacity} // Limita ao máximo permitido pelo quarto
                                value={reservationData.num_people || ""}
                                onChange={handleNumPeopleChange} */}
                                
                            </div><br></br>

                                <div className="input" style={{ marginLeft: "60%" }}>
                                <label htmlFor="payment_status">Tipo de Pagamento:</label>
                                <select
                                 name="payment_status"
                                 value={reservationData.payment_status}
                                 onChange={handleInputChange}
                                 required
                                 style={{ width: "109%", height: "30px" }}
                                  >
                              <option value="">Selecione a Forma</option>
                              <option value="CONFIRMADA">Cartão</option>
                              {/* por esta no backend setado (confirmada,cancelada,pedente) tive que usar cancelada para pix*/}
                              <option value="CANCELADA">Pix</option>
                              <option value="PENDENTE">Fiado</option>
                              </select>
                              </div><br></br>
                                
                            </div>
                        </div>
                        <button type="submit" className="button-cadastro">
                            Cadastrar 
                        </button>
                    </form>
                </div>
                <div className="separator" />
                <div className="gerenciar">
                    {/*Aba onde é exibido os cards das reservas*/}
                    <h1>Gerenciar Reservas</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar por Nome ou Quarto..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    {loading ? (
                        <p>Carregando reservas...</p>
                    ) : (
                        <Container>
                            {filteredReservations.map((reservation) => (
                                <Containerr key={reservation.id} className="banner">
                                    <div className="row">
                                        <p className="nomeReser" style={{ marginLeft: "10%",marginTop:"8%" }} >
                                            <strong>Hóspede</strong><br></br>  {resolveGuestName(reservation.guest as unknown as number)}
                                        </p>
                                        <p className="quarto" style={{ marginLeft: "10%" }}>
                                            <strong>Quarto</strong><br></br>{resolveRoomName(reservation.room as unknown as number)}
                                        </p>
                                        
                                        <p className="check-in" style={{ marginLeft: "10%" }}>
                                         <strong>Check-in</strong> {new Date(reservation.check_in + "T12:00:00").toLocaleDateString('pt-BR')}
                                       </p>
                                        <p className="check-out" style={{ marginLeft: "10%" }}>
                                       <strong>Check-out</strong> {new Date(reservation.check_out + "T12:00:00").toLocaleDateString('pt-BR')}
                                      </p>


                                        
                                    </div>
                                    <div className="buttons">
                                     <CgDetailsMore
                                     className="details"
                                     size={20}
                                    onClick={() => setDetalhesSelecionados(reservation)} // Define a reserva selecionada
                                    />
                                  <FaTrashAlt
                                  className="lixeira"
                                  size={20}
                                 onClick={() => handleDelete(reservation.id)}
                                  />
                                  </div>

                                </Containerr>
                            )).reverse()}
                              
                        </Container>
                    )}
                </div>
                {/*Modal para exibir detalhes da reserva*/}
                {DetalhesSelecionados && (
                <div className="modal-overlay" onClick={handleFecharModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className='faixa'> 
                 <h2 style={{marginTop:"1%"}}>Detalhes da Reserva</h2>
                </div>
           
           
              <div>
                {filteredReservations
                    .filter((reservation) => reservation.id === DetalhesSelecionados.id)
                    .map((reservation) => (
                        <div key={reservation.id}>
                           <div className='userdados'>
                            <h3>Informações</h3>
                            <p>
                                <strong>Hóspede:</strong> {resolveGuestName(reservation.guest as unknown as number)}
                            </p>
                            <p>
                                <strong>Telefone:</strong> {resolveGuestPhone(reservation.guest as unknown as number)}
                            </p>
                            <p>
                                <strong>CPF:</strong> {resolveGuestCPF(reservation.guest as unknown as number)}
                            </p>
                            <p>
                                <strong>Quarto:</strong> {resolveRoomName(reservation.room as unknown as number)}
                            </p>
                            <p>
                                <strong>Tipo:</strong> {resolveRoomType(reservation.room as unknown as number)}
                            </p>
                            <p>
                                <strong>Capacidade:</strong> {resolveRoomCapacity(reservation.room as unknown as number)} pessoas
                            </p>
                            <p>
                            <strong>Presentes:</strong> 
                            </p>

                          
                            <p>
                         <strong>Pagamento :</strong> {reservation.payment_status === "CONFIRMADA" 
                               ? "Cartão" 
                               : reservation.payment_status === "PENDENTE"
                               ? "Fiado"
                               : "Pix"}
                                </p>

                           
                            <p>
                                <strong>Check-in:</strong>{" "}
                                {reservation.check_in
                                    ? new Date(reservation.check_in + "T12:00:00").toLocaleDateString('pt-BR')
                                    : "Não informado"}
                            </p>
                            <p>
                                <strong>Check-out:</strong>{" "}
                                {reservation.check_out
                                    ? new Date(reservation.check_out + "T12:00:00").toLocaleDateString('pt-BR')
                                    : "Não informado"}
                            </p>
                            <p className='totalPrice'>
                                <strong>Preço Total:</strong> R${" "}
                                {typeof reservation.total_price === "number"
                                    ? reservation.total_price.toFixed(2)
                                    : "N/A"}
                                   
                            </p>
                            
                            </div>
                            <div className='gastosex'> 
                            <h3 className='gasto-titulo'>Gastos Extras</h3>

                            <AddConsumptionForm
                             reservationId={DetalhesSelecionados.id}
                             onClose={() => setIsAddingConsumption(false)}
                             onItemsAdded={(updatedItems) => {
                             setDetalhesSelecionados((prev: Reservation) => ({
                            ...prev,
                            consumed_items: updatedItems,
                           }));
                            }}
                           />
                        </div>
                 </div>
                    ))}
                     <div className='divider-vertical-reservation'></div>
                     <div className="divider-horizontal-reservation">  </div>
            </div>
            <button className='closeModal' onClick={handleFecharModal}>Fechar</button>
          </div>
          </div>
              )}

            </div>

        </PageContainer>
    );
}

export default GerenciaReservas;

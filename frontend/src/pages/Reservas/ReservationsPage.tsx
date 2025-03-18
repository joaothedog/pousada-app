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
        room: { id: 0, room_type: 'SIMPLES', name: '', capacity: 0,cooling_type:"VENTILADOR", is_available: true },
        guest_details: { id: 0, name: '', cpf: '', phone: '', email: '' }, // Adicionado para evitar erro
        room_details: { id: 0, room_type: 'SIMPLES', name: '', capacity: 0,cooling_type:"VENTILADOR", is_available: true }, // Adicionado para evitar erro
        check_in: '',
        check_out: '',
        payment_status: 'CONFIRMADA',
        total_price: null,
        extra_charges: 0,
        extra_details: '',
        consumed_items: [],
        daily_rate:0,
        number_of_children:0,
        number_of_guests:0,
    });
    const roomPrices = {
        AR_CONDICIONADO: {
          SIMPLES: 80,
          DUPLO: 150,
          TRIPLO: 210,
          QUADRUPLO: 260,
          QUINTUPLO: 300,
          SEXTUPLO: 360,
        },
        VENTILADOR: {
          SIMPLES: 70,
          DUPLO: 130,
          TRIPLO:180,
      },
      };
    
    
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [DetalhesSelecionados, setDetalhesSelecionados] = useState<any | null>(null);
    const [isAddingConsumption, setIsAddingConsumption] = useState<boolean>(false); 
    const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null); // ID do hóspede selecionado
    const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);





    //função para calcular o preço total
    const resolveTotalPrice = (reservation: Reservation) => {
        if (!reservation) return "Não disponível";
    
        //  Obtém o número de hóspedes e crianças corretamente
        const numberOfGuests = resolveNumberOfGuests(reservation);  
        const numberOfChildren = resolveNumberOfChildren(reservation); 
    
        //  Calcula o número de adultos corretamente
        const numberOfAdults = numberOfGuests - numberOfChildren;
        if (numberOfAdults < 0) throw new Error("Número de crianças maior que o número total de hóspedes.");
    
        // Converte valores para números e trata valores nulos
        const dailyRate = reservation.daily_rate ? parseFloat(reservation.daily_rate.toString()) : 0;
        const extraCharges = reservation.extra_charges ? parseFloat(reservation.extra_charges.toString()) : 0;
    
        //  Divide o valor da diária pelo número total de hóspedes
        const pricePerGuest = dailyRate / numberOfGuests;
    
        //  Aplica desconto para crianças (50% do valor do adulto)
        const adultTotal = numberOfAdults * pricePerGuest; // Adultos pagam 100%
        const childTotal = numberOfChildren * (pricePerGuest * 0.5); // Crianças pagam 50%
    
        //  Calcula o número de dias da reserva (mínimo 1)
        const checkInDate = new Date(reservation.check_in);
        const checkOutDate = new Date(reservation.check_out);
        const totalDays = Math.max((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24), 1);
    
        //  Calcula o valor total da reserva
        const totalPrice = (adultTotal + childTotal) * totalDays + extraCharges;
    
        //  Debugging no console para verificar os valores
        console.log(`Número total de hóspedes: ${numberOfGuests}`);
        console.log(`Número de crianças: ${numberOfChildren}`);
        console.log(`Número de adultos: ${numberOfAdults}`);
        console.log(`Diária total: R$ ${dailyRate}`);
        console.log(`Preço por hóspede: R$ ${pricePerGuest}`);
        console.log(`Total diário (adultos + crianças): R$ ${(adultTotal + childTotal)}`);
        console.log(`Total final para ${totalDays} dias: R$ ${totalPrice}`);
    
        return `R$ ${totalPrice.toFixed(2)}`;
    };
    
    
//usado para carregar os items no modal 
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



   
       const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
    
        setReservationData((prevData) => {
            let updatedValue: any = value;
    
            //  Se for um número de crianças ou hóspedes, converte corretamente para número
            if (name === "number_of_children" || name === "number_of_guests") {
                updatedValue = parseInt(value) || 0; // Garante que seja um número válido
            }
    
            //  Evita que o número de hóspedes seja menor que o número de crianças
            if (name === "number_of_guests" && updatedValue < prevData.number_of_children) {
                console.warn("Número de hóspedes não pode ser menor que o número de crianças.");
                updatedValue = prevData.number_of_children;
            }
    
            //  Quando o usuário escolhe um hóspede existente, atualiza os dados automaticamente
            if (name === "existingGuest") {
                const selectedGuest = guests.find((guest) => guest.id === parseInt(value));
                setSelectedGuestId(parseInt(value) || null);
                if (selectedGuest) {
                    console.log(`Selecionando hóspede existente: ${selectedGuest.name}`);
                    return {
                        ...prevData,
                        guest: { ...selectedGuest }, // Atualiza os dados do hóspede
                    };
                }
            }
    
            //  Permite a edição manual dos dados do hóspede (ex: alterar nome, CPF)
            if (name.startsWith("guest.")) {
                const guestKey = name.split(".")[1];
                console.log(`Editando campo do hóspede: ${guestKey} -> ${value}`);
                return {
                    ...prevData,
                    guest: { ...prevData.guest, [guestKey]: value },
                };
            }
    
            //  Atualiza os detalhes do quarto ao selecionar
            if (name === "room") {
                const selectedRoom = rooms.find((room) => room.id === parseInt(value));
                if (selectedRoom) {
                    console.log(`Selecionando quarto: ${selectedRoom.name}`);
                }
                updatedValue = selectedRoom || prevData.room;
            }
    
            //  Depuração no console para verificar os valores antes de salvar
            console.log(`Alterando campo: ${name} -> ${updatedValue}`);
    
            return {
                ...prevData,
                [name]: updatedValue,
            };
        });
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
    
            // **Corrige a conversão dos valores**
            const numberOfGuests = parseInt(reservationData.number_of_guests.toString()) || 1;
            const numberOfChildren = parseInt(reservationData.number_of_children.toString()) || 0;
    
            // **Depuração antes de enviar para a API**
            console.log("Preparando envio da reserva...");
            console.log(`Número de hóspedes: ${numberOfGuests}`);
            console.log(`Número de crianças: ${numberOfChildren}`);
            console.log(`Diária: R$ ${reservationData.daily_rate}`);
    
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
                daily_rate: reservationData.daily_rate,
                number_of_children: numberOfChildren,
                number_of_guests: numberOfGuests, // **Agora corretamente salvo**
            };
    
            console.log("Enviando payload para API:", reservationPayload);
    
            const newReservation = await createReservation(reservationPayload);
    
            setReservations((prev) => [newReservation, ...prev]);
            setFilteredReservations((prev) => [newReservation, ...prev]);
    
            alert("Reserva criada com sucesso!");
        } catch (error) {
            console.error("Erro ao criar reserva:", error);
            alert("Erro ao criar reserva! Verifique os dados.");
        }
    };
    
    
    
    


 //useEffect feito para carregar os dados 
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


    const handleAbrirModal = (reservationId: number) => {
        const selectedReservation = filteredReservations.find(reservation => reservation.id === reservationId);
     
        setDetalhesSelecionados(selectedReservation);
    };
    
   
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
    const getRoomType = (roomId: any) => {
        const room = rooms.find((r) => r.id === roomId);
        return room ? room.room_type.toLowerCase() : '';
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
    

    //useEffect para que a busca seja filtrada tanto pelo searchterm (buscador) quanto pelo roomtype (buttons)
    useEffect(() => {
        if (!searchTerm.trim() && !selectedRoomType) {
            setFilteredReservations(reservations);
            return;
        }
    
        const searchLower = searchTerm.toLowerCase();
        const formattedSearchTerm = searchTerm.replace(/\//g, '-').toLowerCase();
    
        setFilteredReservations(
            reservations.filter((reservation) => {
                const guestName = getGuestName(reservation.guest).toLowerCase();
                const roomNumber = getRoomName(reservation.room).toLowerCase();
                const roomType = getRoomType(reservation.room).toLowerCase();
                const checkInDate = reservation.check_in.replace(/\//g, '-').toLowerCase();
    
                const matchesSearchTerm =
                    searchLower &&
                    (roomType.includes(searchLower) ||
                     guestName.includes(searchLower) ||
                     roomNumber.includes(searchLower) ||
                     checkInDate.includes(formattedSearchTerm));
    
                const matchesRoomType = selectedRoomType
                    ? roomType === selectedRoomType.toLowerCase()
                    : true;
    
                return matchesRoomType && (!searchTerm.trim() || matchesSearchTerm);
            })
        );
    }, [searchTerm, selectedRoomType, reservations, guests, rooms]);
    
    const handleFilterRoomType = (roomType:any) => {
        setSelectedRoomType(roomType); // Atualiza o estado do tipo de quarto
    };
    

   
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

const resolveNumberOfGuests = (reservation: Reservation) => {
    return reservation ? reservation.number_of_guests : 1; 
};



const resolveNumberOfChildren = (reservation: Reservation) => {
    return reservation.number_of_children ?? 0; 
};

const resolveDailyRate = (reservation: Reservation) => {
    return reservation.daily_rate ? `R$ ${reservation.daily_rate}` : "Não disponível";
};


  




    return (
        <PageContainer padding="0px">
            <div className="main2">
                <SidebarComponent />
                <div className="criar">
                    {/*Aba de cadastro dos cards das reservas */}
                    <h1>Cadastrar Reserva</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="cadastro-reservation">
                            <div className="row">
                            <div className="input" style={{marginLeft:"-20%",marginTop:"-1%"}}>
                                    <label htmlFor="Guest">Hóspede  Existente:</label>
                                    <select 
                                     name="existingGuest" 
                                     value={selectedGuestId || ""}
                                     onChange={handleInputChange}
                                    
                                     style={{width:"90%",height:"30px"}}
                                     >
                                        <option value="">Selecione um Hóspede</option>
                                        {guests.map((guest) => (
                                            <option key={guest.id} value={guest.id} >
                                                {guest.name} 
                                            </option>
                                        ))}
                                    </select>
                                </div><br></br>
                                <div className="input" style={{marginLeft:"-20%"}}>
                                    <label htmlFor="guest.name">Nome do Hóspede:</label>
                                    <input
                                        type="text"
                                        name="guest.name"
                                        value={reservationData.guest.name}
                                        onChange={handleInputChange}
                                        required
                                        style={{width:"84%",}}
                                    />
                                </div><br></br>
                                <div className="input" style={{marginLeft:"-20%"}}>
                                    <label htmlFor="guest.cpf">CPF:</label>
                                    <input
                                        type="text"
                                        name="guest.cpf"
                                        value={reservationData.guest.cpf}
                                        onChange={handleInputChange}
                                        required
                                        style={{width:"84%",}}
                                    />
                                </div><br></br>
                                <div className="input" style={{marginLeft:"-20%"}}>
                                    <label htmlFor="guest.phone">Telefone:</label>
                                    <input
                                        placeholder='ex:(77)78898989'
                                        type="text"
                                        name="guest.phone"
                                        value={reservationData.guest.phone}
                                        onChange={handleInputChange}
                                        required
                                        style={{width:"84%",}}
                                    />
                                </div><br></br>
                                
                                <div className="input" style={{marginLeft:"-20%"}}>
                                    <label htmlFor="guest.email">Email:</label>
                                    <input
                                        placeholder='ex:@email.com'
                                        type="text"
                                        name="guest.email"
                                        value={reservationData.guest.email}
                                        onChange={handleInputChange}
                                     
                                        style={{width:"84%",}}
                                    />
                                </div><br></br>
                                <div className="input" style={{ marginLeft: "-20%" }}>
                               <label htmlFor="number_of_children">Crianças (10 a 12 anos):</label>
                                <input
                                 type="number"
                                 name="number_of_children"
                                 min="0"
                                 value={reservationData.number_of_children}  
                                 onChange={handleInputChange} 
                                 style={{ width: "84%", height: "17px" }}
                                  />
                                 </div>
                                <br></br>
                                <div className="input" style={{ marginLeft: "60%",marginTop:"-140%" }}>
                               <label htmlFor="number_of_guests">Quantidade de Pessoas:</label>
                                <input
                                 type="number"
                                 name="number_of_guests"
                                 min="0"
                                 value={reservationData.number_of_guests}  
                                 onChange={handleInputChange} 
                                 style={{ width: "84%", height: "17px" }}
                                  />
                                 </div>
                                <br></br>
                                <div className="input" style={{marginLeft:"60%"}}>
                                    <label htmlFor="check_in">Data de Check-in:</label>
                                    <input
                                        type="date"
                                        name="check_in"
                                        value={reservationData.check_in}
                                        onChange={handleInputChange}
                                        required
                                        style={{width:"84%"}}
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
                                        style={{width:"84%"}}
                                    />
                                </div><br></br>
                                
                                <div className="input" style={{marginLeft:"60%"}}>
                                    <label htmlFor="room">Quarto:</label>
                                    <select
                                        name="room"
                                        value={reservationData.room.id}
                                        onChange={handleInputChange}
                                        required
                                        style={{width:"90%",height:"30px"}}
                                    >
                                        <option value="">Selecione um quarto</option>
                                        {rooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                {room.name} ({room.room_type} + {room.cooling_type})
                                            </option>
                                        ))}
                                    </select>
                                </div><br></br>
                                <div className="input" style={{ marginLeft: "60%" }}>
                                <label htmlFor="daily_rate">Diária (R$):</label>
                                <select
                                 name="daily_rate"
                                 value={reservationData.daily_rate}
                                 onChange={handleInputChange}
                                 required
                                 style={{ width: "90%", height: "30px" }}
                                 >
                               <option value="">Selecione o preço</option>
                              {/* Iterar sobre os preços de AR_CONDICIONADO */}
                              {Object.entries(roomPrices.AR_CONDICIONADO).map(([type, price]) => (
                              <option key={`AC-${type}`} value={price}>
                              {`R$ ${price} - ${type} (Ar Condicionado)`}
                              </option>
                               ))}
                              {/* Iterar sobre os preços de VENTILADOR */}
                              {Object.entries(roomPrices.VENTILADOR).map(([type, price]) => (
                              <option key={`V-${type}`} value={price}>
                               {`R$ ${price} - ${type} (Ventilador)`}
                             </option>
                                ))}
                             </select>
                             </div>
                             <br />
                          
                                <div className="input" style={{ marginLeft: "60%" }}>
                                <label htmlFor="payment_status">Tipo de Pagamento:</label>
                                <select
                                 name="payment_status"
                                 value={reservationData.payment_status}
                                 onChange={handleInputChange}
                                 required
                                 style={{ width: "90%", height: "30px" }}
                                  >
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
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div><br></br>
                    <div className="filters-reservation">
                    <button onClick={() => handleFilterRoomType(null)}>Todos</button>
                    <button onClick={() => handleFilterRoomType("SIMPLES")}>Simples</button>
                    <button onClick={() => handleFilterRoomType("DUPLO")}>Duplo</button>
                    <button onClick={() => handleFilterRoomType("TRIPLO")}>Triplo</button>
                    <button onClick={() => handleFilterRoomType("QUADRUPLO")}>Quádruplo</button>
                    <button onClick={() => handleFilterRoomType("QUINTUPLO")}>Quíntuplo</button>
                    <button onClick={() => handleFilterRoomType("SEXTUPLO")}>Sêxtuplo</button>
                    </div>

                    {loading ? (
                        <p>Carregando reservas...</p>
                    ) : (
                        <Container>
                            {filteredReservations.map((reservation) => (
                                <Containerr key={reservation.id} className="banner-reservation">
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
                                     className="details-reservation"
                                     size={20}
                                    onClick={() => handleAbrirModal(reservation.id)} // Define a reserva selecionada
                                    />
                                  <FaTrashAlt
                                  className="lixeira-reservation"
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
                <div className="modal-content-reservation" onClick={(e) => e.stopPropagation()}>
                <div className='faixa-reservation'> 
                 <h2 style={{marginTop:"1%"}}>Detalhes da Reserva</h2>
                </div>
           
           
              <div>
                {filteredReservations
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
                          <strong>Hóspedes:</strong> {resolveNumberOfGuests(reservation)}
                            </p>

                            <p>
                            <strong>Crianças:</strong> {resolveNumberOfChildren(reservation)}
                            </p>

                            <p>
                           <strong>Diária:</strong> {resolveDailyRate(reservation)}
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
                            <strong>Preço Total:</strong> {resolveTotalPrice(reservation)}
                            </p>




                            </div>
                            <div className='gastosex'> 
                            <h3 className='gasto-titulo'>Gastos Extras</h3>

                            <AddConsumptionForm
                             reservationId={reservation.id}
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
            <button className='closeModal-reservation' onClick={handleFecharModal}>Fechar</button>
          </div>
          </div>
              )}

            </div>

        </PageContainer>
    );
}

export default GerenciaReservas;

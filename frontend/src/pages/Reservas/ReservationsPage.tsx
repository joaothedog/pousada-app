import React, { useEffect, useState } from 'react';
import { getReservations, createReservation, deleteReservation, getRooms, createGuest, getGuests } from '../../services/api';
import { PageContainer } from '../../components/PageContainer';
import { SidebarComponent } from '../../components/sidebar/index';
import { Container, Containerr } from './styles';
import "./styles.css";
import { FaTrashAlt } from 'react-icons/fa';
import { CgDetailsMore } from "react-icons/cg";
import {  Guest, Room, ReservationItem, Reservation, InventoryItem } from '../../types/types';
import { createInventoryItem,getInventoryItems } from '../../services/api'; 







export function GerenciaReservas() {


    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]); // Tipando o estado corretamente como InventoryItem[]

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reservationData, setReservationData] = useState<Reservation>({
        id: 0,
        guest: { id: 0, name: '', cpf: '', phone: '', email: '' },
        room: { id: 0, room_type: 'SIMPLES', name: '', capacity: 0, daily_rate: 0, is_available: true },
        guest_details: { id: 0, name: '', cpf: '', phone: '', email: '' },
        room_details: { id: 0, room_type: 'SIMPLES', name: '', capacity: 0, daily_rate: 0, is_available: true },
        check_in: '',
        check_out: '',
        payment_status: 'PENDENTE',
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
      const [isAddingConsumption, setIsAddingConsumption] = useState<boolean>(false); // Controle para exibir o formulário de consumo
      const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
       const [itemQuantity, setItemQuantity] = useState<number>(1);

      
// Atualiza o item selecionado
const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedItemId = parseInt(e.target.value);
    const item = inventoryItems.find(item => item.id === selectedItemId);
    setSelectedItem(item || null);
  };
  
  // Atualiza a quantidade
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemQuantity(parseInt(e.target.value));
  };


  useEffect(() => {
    const fetchInventoryItems = async () => {
        try {
            const items = await getInventoryItems();
            const receptionItems = items.map((item) => ({
                ...item,
                price: typeof item.price === 'number' ? item.price : 0, // Define o preço como 0 se não for um número
            })).filter((item) => item.location === 'RECEPCAO');
            setInventoryItems(receptionItems);
        } catch (error) {
            console.error('Erro ao carregar itens do inventário:', error);
        }
    };

    fetchInventoryItems();
}, []);


const handleAddConsumedItem = () => {
    if (!selectedItem || itemQuantity <= 0) {
        alert('Selecione um item e insira uma quantidade válida.');
        return;
    }

    const consumedItem: ReservationItem = {
        id: Date.now(), // Gera um ID único
        reservation: reservationData, // Referência à reserva associada
        item: selectedItem, // Item do inventário consumido
        item_details: selectedItem, // Detalhes do item consumido
        quantity: itemQuantity, // Quantidade informada
        total_price: itemQuantity * selectedItem.price, // Calcula o preço total
    };

    setReservationData((prev) => ({
        ...prev,
        consumed_items: [...(prev.consumed_items || []), consumedItem],
    }));

    // Reseta os campos de seleção
    setSelectedItem(null);
    setItemQuantity(1);
};


      

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
   
       const handleInputChange = (
           e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
       ) => {
           const { name, value } = e.target;
   
           // Verifica se o campo é do tipo guest ou room
           if (name.startsWith('guest.')) {
               const guestKey = name.split('.')[1]; // Ex: name, cpf, phone
               setReservationData((prevData) => ({
                   ...prevData,
                   guest: { ...prevData.guest, [guestKey]: value },
               }));
           } else if (name === 'room') {
               const selectedRoom = rooms.find((room) => room.id === parseInt(value))!;
               setReservationData((prevData) => ({
                   ...prevData,
                   room: selectedRoom,
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
   
           // Primeiro, cria o hóspede
           try {
               let guestId = reservationData.guest.id;
   
               if (guestId === 0) { // Se o hóspede não existe (id 0), cria um novo
                   const guestPayload: Guest = {
                       name: reservationData.guest.name,
                       cpf: reservationData.guest.cpf,
                       phone: reservationData.guest.phone,
                       email: reservationData.guest.email,
                       id: reservationData.guest.id
                   };
   
                   const guestResponse = await createGuest(guestPayload); // Cria o hóspede
                   guestId = guestResponse.data.id; // Obtém o ID do hóspede criado
               }
   
               // Após criar o hóspede, cria a reserva
               const reservationPayload = {
                   ...reservationData,
                   guest: guestId, // Passa o ID do hóspede
                   room: reservationData.room.id, // Passa o ID do quarto
               };
               const newReservation = await createReservation(reservationPayload);

                  // Adiciona a nova reserva à lista local
        setReservations((prev) => [newReservation, ...prev]);
        setFilteredReservations((prev) => [newReservation, ...prev]);
               const reservationResponse = await createReservation(reservationPayload); // Cria a reserva
               console.log('Reserva criada com sucesso:', reservationResponse.data);
               alert('Reserva criada com sucesso!');
           } catch (error) {
               console.error('Erro ao criar reserva ou hóspede:', error);
               alert('Erro ao criar reserva ou hóspede! Verifique os dados.');
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
  


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
    
            if (searchTerm.trim() === '') {
                setFilteredReservations(reservations); // Mostra todas as reservas se o termo de busca estiver vazio
            } else {
                const searchTermLower = searchTerm.toLowerCase();
    
                setFilteredReservations(
                    reservations.filter((reservation) => {
                        const guestName = reservation.guest?.name?.toLowerCase() || '';
                        const roomNumber = reservation.room?.name?.toLowerCase() || '';
    
                        return (
                            guestName.includes(searchTermLower) || // Busca pelo nome do hóspede
                            roomNumber.includes(searchTermLower)  // Busca pelo número do quarto
                        );
                    })
                );
            }
        }
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
    
    const handleDeleteConsumedItem = (index: number) => {
        setReservationData((prev) => {
            const updatedConsumedItems = [...(prev.consumed_items || [])];
            updatedConsumedItems.splice(index, 1); // Remove o item pelo índice
            return { ...prev, consumed_items: updatedConsumedItems };
        });
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

const resolveRoomDailyRate = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.daily_rate.toFixed(2) : '0,00';
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
                                <div className="input">
                                    <label htmlFor="guest.name">Nome do Hóspede:</label>
                                    <input
                                        type="text"
                                        name="guest.name"
                                        value={reservationData.guest.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                <div className="input">
                                    <label htmlFor="guest.cpf">CPF:</label>
                                    <input
                                        type="text"
                                        name="guest.cpf"
                                        value={reservationData.guest.cpf}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                <div className="input">
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
                                <div className="input">
                                    <label htmlFor="room">Quarto:</label>
                                    <select
                                        name="room"
                                        value={reservationData.room.id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione um quarto</option>
                                        {rooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                {room.name} ({room.room_type})
                                            </option>
                                        ))}
                                    </select>
                                </div><br></br>
                                <div className="input">
                                    <label htmlFor="check_in">Data de Check-in:</label>
                                    <input
                                        type="date"
                                        name="check_in"
                                        value={reservationData.check_in}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div><br></br>
                                <div className="input">
                                    <label htmlFor="check_out">Data de Check-out:</label>
                                    <input
                                        type="date"
                                        name="check_out"
                                        value={reservationData.check_out}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
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
                            onKeyDown={handleSearch}
                        />
                    </div>
                    {loading ? (
                        <p>Carregando reservas...</p>
                    ) : (
                        <Container>
                            {filteredReservations.map((reservation) => (
                                <Containerr key={reservation.id} className="banner">
                                    <div className="row">
                                        <p className="nome" style={{ marginLeft: "10%",marginTop:"7.8%" }} >
                                            <strong>Hóspede:</strong> {resolveGuestName(reservation.guest as unknown as number)}
                                        </p>
                                        <p className="quarto" style={{ marginLeft: "10%" }}>
                                            <strong>Quarto:</strong> {resolveRoomName(reservation.room as unknown as number)}
                                        </p>
                                        <p className="check-in" style={{ marginLeft: "10%" }}>
                                        <strong>Check-in:</strong> {new Date(reservation.check_in).toLocaleDateString('pt-BR')}
                                        </p>
                                        <p className="check-out" style={{ marginLeft: "10%" }}>
                                       <strong>Check-out:</strong> {new Date(reservation.check_out).toLocaleDateString('pt-BR')}
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
                            <p>
                                <strong>Hóspede:</strong> {resolveGuestName(reservation.guest as unknown as number)}
                            </p>
                            <p>
                                <strong>Telefone:</strong> {resolveGuestPhone(reservation.room as unknown as number)}
                            </p>
                            <p>
                                <strong>CPF:</strong> {resolveGuestCPF(reservation.room as unknown as number)}
                            </p>
                            <p>
                                <strong>Quarto:</strong> {resolveRoomName(reservation.room as unknown as number)}
                            </p>
                            <p>
                                <strong>Tipo :</strong> {resolveRoomType(reservation.room as unknown as number)}
                            </p>
                            <p>
                                <strong>Capacidade  :</strong> {resolveRoomCapacity(reservation.room as unknown as number)} pessoas
                            </p>
                          
                            <p>
                            <strong>Diária:</strong> R${resolveRoomDailyRate(reservation.room.id)}
                            </p>

                           
                            <p>
                                <strong>Check-in:</strong>{" "}
                                {reservation.check_in
                                    ? new Date(reservation.check_in).toLocaleDateString("pt-BR")
                                    : "Não informado"}
                            </p>
                            <p>
                                <strong>Check-out:</strong>{" "}
                                {reservation.check_out
                                    ? new Date(reservation.check_out).toLocaleDateString("pt-BR")
                                    : "Não informado"}
                            </p>
                            <p className='totalPrice'>
                                <strong>Preço Total:</strong> R${" "}
                                {typeof reservation.total_price === "number"
                                    ? reservation.total_price.toFixed(2)
                                    : "N/A"}
                                    <div className="divider-horizontal" style={{marginLeft:"-29%"}}>  </div>
                            </p>
                            
                            </div>
                            <div className='gastosex'> 
                            <p><strong>Gastos Extras:</strong></p>

                           <select onChange={handleItemSelect} value={selectedItem?.id || ''}>
                           <option value="">Selecione um item</option>
                             {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                            {item.name} 
                           </option>
                             ))}
                           </select>
                           <br />

                         <input 
                          style={{ marginTop: "4%", width: "52.7%" }}
                          type="number"
                          value={itemQuantity}
                          onChange={handleQuantityChange}
                          min="1"
                          max="100"
                          placeholder="Quantidade"
                          />
                         <br />

                         <button 
                           style={{ marginTop: "4%", width: "56%", cursor: "pointer" }} 
                           onClick={handleAddConsumedItem}>
                           Adicionar
                        </button>

                        <h3>Itens Consumidos:</h3>
    <div className="consumed-items-list">
        {reservation.consumed_items && reservation.consumed_items.length > 0 ? (
            reservation.consumed_items.map((item, index) => (
                <div key={index} className="consumed-item">
                    <p>
                        <strong>Item:</strong> {item.item_details?.name || "Desconhecido"}
                    </p>
                    <p>
                        <strong>Quantidade:</strong> {item.quantity || 0}
                    </p>
                    <FaTrashAlt
                        className="delete-icon"
                        onClick={() => handleDeleteConsumedItem(index)}
                    />
                    <hr />
                </div>
            ))
        ) : (
            <p>Nenhum item consumido registrado.</p>
        )}
    </div>


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

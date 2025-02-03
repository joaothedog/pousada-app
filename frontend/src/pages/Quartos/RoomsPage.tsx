import React, { useEffect, useState } from 'react';
import { getRooms, deleteRoom, createRoom, getReservations, getGuests } from '../../services/api';
import { PageContainer } from '../../components/PageContainer';
import { SidebarComponent } from '../../components/sidebar/index';
import { Container, Containerr } from './styles';
import "./styles.css";
import { FaTrashAlt } from 'react-icons/fa';
import { TbListDetails } from "react-icons/tb";

export function GerenciaQuartos() {
    interface Room {
        id: number;
        name: string;
        room_type: string;
        capacity: number;
        daily_rate: number;
        is_available: boolean;
    }

    interface Reservation {
        id: number;
        room: number;
        guest: number;
        check_in: string;
        check_out: string;
    }

    interface Guest {
        id: number;
        name: string;
    }

    const [formData, setFormData] = useState({
        room_type: 'SIMPLES',
        name: '',
        capacity: 1,
        daily_rate: 0,
        is_available: true,
    });
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [searchName, setSearchName] = useState('');
    const [loading, setLoading] = useState(false);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [selectedRoomReservations, setSelectedRoomReservations] = useState<Reservation[] | null>(null);

    useEffect(() => {
        carregarQuartos();
        carregarReservas();
        carregarHospedes();
    }, []);

    const carregarQuartos = async () => {
        setLoading(true);
        try {
            const data = await getRooms();
            setRooms(data);
            setFilteredRooms(data);
        } catch (error) {
            console.error('Erro ao carregar quartos:', error);
        } finally {
            setLoading(false);
        }
    };

    const carregarReservas = async () => {
        try {
            const data = await getReservations();
            const reservations: Reservation[] = data.map((item: any) => ({
                id: item.id,
                room: item.room,
                guest: item.guest,
                check_in: item.check_in,
                check_out: item.check_out,
            }));
            setReservations(reservations);
        } catch (error) {
            console.error('Erro ao carregar reservas:', error);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchName.trim() === '') {
                setFilteredRooms(rooms);
            } else {
                setFilteredRooms(rooms.filter((room) => 
                    room.name.toLowerCase().includes(searchName.toLowerCase())
                ));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRoom(formData);
            alert('Quarto criado com sucesso!');
            setFormData({
                room_type: 'SIMPLES',
                name: '',
                capacity: 1,
                daily_rate: 0,
                is_available: true,
            });
            carregarQuartos();
        } catch (error) {
            console.error('Erro ao criar quarto:', error);
            alert('Erro ao criar o quarto. Por favor, tente novamente.');
        }
    };

    const handleDelete = async (roomId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este quarto?')) {
            try {
                await deleteRoom(roomId);
                alert('Quarto excluído com sucesso!');
                setRooms((prev) => prev.filter((room) => room.id !== roomId));
                setFilteredRooms((prev) => prev.filter((room) => room.id !== roomId));
            } catch (error) {
                console.error('Erro ao excluir quarto:', error);
                alert('Erro ao excluir quarto!');
            }
        }
    };

    const handleShowRoomDetails = (roomId: number) => {
        const relatedReservations = reservations.filter((reservation) => reservation.room === roomId);
        setSelectedRoomReservations(relatedReservations);
    };

    const handleCloseModal = () => {
        setSelectedRoomReservations(null);
    };

    const getGuestName = (guestId: number): string => {
        const guest = guests.find((g) => g.id === guestId);
        return guest ? guest.name : 'Hóspede não encontrado';
    };

    return (
        <PageContainer padding="0px">
            <div className="main2">
                <SidebarComponent />
                <div className="criar">
                    {/*Aba para cadastrar os cards dos quartos*/}
                    <h1>Cadastro de Quartos</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="cadastro">
                            <div className="row">
                                <div className="input">
                                    <label htmlFor="name">Número do Quarto:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Ex.: Quarto 101"
                                        required
                                    />
                                </div><br></br>
                                <div className="input">
                                    <label htmlFor="capacity">Capacidade:</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </div><br></br>
                                <div className="input">
                                    <label htmlFor="daily_rate">Taxa Diária (R$):</label>
                                    <input
                                        type="number"
                                        name="daily_rate"
                                        value={formData.daily_rate}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div><br></br>

                                <div className="input">
                                    <label htmlFor="room_type">Tipo de Quarto:</label>
                                    <select
                                        name="room_type"
                                        value={formData.room_type}
                                        onChange={handleInputChange}
                                        style={{width:"109%"}}
                                    >
                                        <option value="SIMPLES">Individual</option>
                                        <option value="DUPLO">Duplo</option>
                                        <option value="TRIPLO">Triplo</option>
                                        <option value="QUADRUPLO">Quádruplo</option>
                                        <option value="QUINTUPLO">Quíntuplo</option>
                                        <option value="SEXTUPLO">Sêxtuplo</option>
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
                    {/*Aba para exibir os cards dos quartos*/}
                    <h1>Gerenciar Quartos</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchName}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    {loading ? (
                        <p>Carregando quartos...</p>
                    ) : (
                        <Container>
                            {filteredRooms.map((room) => (
                                <Containerr key={room.id} className="banner" isAvailable={room.is_available}>
                                    <div className="row">
                                        <p className="nome">
                                            <strong>Número:</strong> {room.name}
                                        </p>
                                        <p className="tipo">
                                            <strong>Tipo:</strong> {room.room_type}
                                        </p>
                                        <p className="capacidade">
                                            <strong>Capacidade:</strong> {room.capacity} pessoas
                                        </p>
                                        <p className="diaria">
                                            <strong>Diária:</strong> R$ {Number(room.daily_rate).toFixed(2)}
                                        </p>

                                        <p className="disponivel">
                                            <strong>Disponível:</strong> {room.is_available ? 'Sim' : 'Não'}
                                        </p>
                                    </div>
                                    <div className='buttons'>
                                       <TbListDetails 
                                           className='detail' 
                                           size={20} 
                                           onClick={() => handleShowRoomDetails(room.id)} 
                                       />
                                       <FaTrashAlt 
                                           className='lixeira' 
                                           size={20} 
                                           onClick={() => handleDelete(room.id)} 
                                       />
                                    </div>
                                </Containerr>
                            )).reverse()}
                        </Container>
                    )}
                </div>
                {/*Modal para exibir reservas relacionadas ao quarto selecionado*/}
                {selectedRoomReservations && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className='faixa'>
                            <h2   style={{marginTop:"1%"}}>Reservas Relacionadas</h2>
                            </div>
                            
                            {selectedRoomReservations.length > 0 ? (
                                <ul>
                                    {selectedRoomReservations.map((reservation) => (
                                        <li key={reservation.id}>
                                            <strong>Hóspede:</strong> {getGuestName(reservation.guest)} -
                                            <strong> Check-in:</strong> {new Date(reservation.check_in).toLocaleDateString('pt-BR')} -
                                            <strong> Check-out:</strong> {new Date(reservation.check_out).toLocaleDateString('pt-BR')}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="msg-n">Não há reservas para este quarto.</p>
                            )}
                            <button className='closeModal' onClick={handleCloseModal}>Fechar</button>
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}

export default GerenciaQuartos;

import React, { useContext, useEffect, useState } from 'react';
import { getGuests, deleteGuest, createGuest } from '../../services/api';
import { PageContainer } from '../../components/PageContainer';
import { SidebarComponent } from '../../components/sidebar/index';
import { Container, Containerr, Main,} from './styles';
import "./styles.css"
import { FaTrashAlt } from 'react-icons/fa';
import { FaUserAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { ThemeContext } from "../../components/ThemeContext/ThemeContext";

export function GerenciaHospedes() {
    interface Guest {
        id: number;
        name: string;
        cpf: string;
        phone: string;
        email?: string;
    }

    const [formData, setFormData] = useState({ name: '', cpf: '', phone: '', email: '' });
    const [guests, setGuests] = useState<Guest[]>([]);
    const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
    const [searchName, setSearchName] = useState('');
    const [loading, setLoading] = useState(false);

      const themeContext = useContext(ThemeContext);
    
      if (!themeContext) {
        throw new Error("useContext must be used within a ThemeProvider");
      }
    
      const { darkMode } = themeContext;
      

    useEffect(() => {
        carregarHospedes();
    }, []);

    const carregarHospedes = async () => {
        setLoading(true);
        try {
            const data = await getGuests();
            setGuests(data);
            setFilteredGuests(data);
        } catch (error) {
            console.error('Erro ao carregar hóspedes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value);
    };

    const handleSearch = () => {
        if (searchName.trim() === '') {
            setFilteredGuests(guests);
        } else {
            setFilteredGuests(guests.filter((guest) => 
                guest.name.toLowerCase().includes(searchName.toLowerCase())
            ));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createGuest(formData);
            alert('Hóspede criado com sucesso!');
            setFormData({ name: '',
                 cpf: '',
                  phone: '',
                   email: '' });
            carregarHospedes();
        } catch (error) {
            console.error('Erro ao criar hóspede:', error);
            alert('Erro ao criar hóspede!');
        }
    };

    const handleDelete = async (guestId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este hóspede?')) {
            try {
                await deleteGuest(guestId);
                alert('Hóspede excluído com sucesso!');
                setGuests((prev) => prev.filter((guest) => guest.id !== guestId));
                setFilteredGuests((prev) => prev.filter((guest) => guest.id !== guestId));
            } catch (error) {
                console.error('Erro ao excluir hóspede:', error);
                alert('Erro ao excluir hóspede!');
            }
        }
    };

    return (
        <PageContainer padding="0px" darkMode={darkMode}>
            <Main darkMode={darkMode}>
            <div className="main2">
                <SidebarComponent />
                <div className="criar">
                    <h1>Cadastro de Hóspedes</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="cadastro">
                            <div className="row">
                                <div className="input">
                                    <label htmlFor="name">Nome:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder='Nome e Sobrenome'
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <br />
                                <div className="input">
                                    <label htmlFor="cpf">CPF:</label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <br />
                                <div className="input">
                                    <label htmlFor="phone">Telefone:</label>
                                    <input
                                        placeholder='ex:(77)78898989'
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <br />
                                <div className="input">
                                    <label htmlFor="email">Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
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
                    <h1>Gerenciar Hóspedes</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar por Nome..."
                            value={searchName}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearch}
                        />
                        
                    </div>
                    {loading ? (
                        <p>Carregando hóspedes...</p>
                    ) : (
                        <Container >
                            {filteredGuests.map((guest) => (
                                <Containerr key={guest.id} className="banner-guest" darkMode={darkMode}>
                                    <div className="row">
                                        <img src='/icon.png' alt='logo' className='user'>
                                        </img>
                                        <p className="nomeHosp" style={{ marginLeft: "10%" }}>
                                            <strong>Nome</strong><br></br> {guest.name}
                                        </p>
                                        <p className="phone" style={{ marginLeft: "10%" }} >
                                            <strong>Telefone:</strong> {guest.phone}
                                        </p>
                                        <p></p>
                                    </div>
                                    <div className='buttons'>
                                        <FaTrashAlt className='lixeira' size={20} onClick={() => handleDelete(guest.id)}/>
                                    </div>
                                </Containerr>
                            )).reverse()}
                        </Container>
                    )}
                </div>
            </div>
            </Main>
        </PageContainer>
    );
}

export default GerenciaHospedes;


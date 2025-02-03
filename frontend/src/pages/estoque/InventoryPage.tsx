import React, { useEffect, useState } from 'react';
import { getInventoryItems, createInventoryItem, deleteInventoryItem,createInventoryConsumption, getInventoryConsumptions,deleteInventoryConsumption  } from '../../services/api';


import { PageContainer } from '../../components/PageContainer';
import { SidebarComponent } from '../../components/sidebar/index';
import { Container, Containerr } from './styles';
import "./styles.css";
import { FaTrashAlt } from 'react-icons/fa';
import { FaPencil } from "react-icons/fa6";

interface InventoryItem {
    id: number;
    name: string;
    location: string;
    quantity: number;
    price: number;
    originalQuantity: number;
}
interface InventoryReduction {
    id: number;
    quantity: number;
    date: string;
}


export function GerenciaInventario() {
    const [formData, setFormData] = useState({
        name: '',
        location: 'RECEPCAO',
        quantity: 0,
        price: 0.0,
    });

    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [reductions, setReductions] = useState<{ [key: number]: InventoryReduction[] }>({});
    const [reductionData, setReductionData] = useState({ quantity: 0, date: '' });
    const [newQuantity, setNewQuantity] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalReductionsValue, setTotalReductionsValue] = useState<number | null>(null);

    const fetchInventoryItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const items = await getInventoryItems();
            if (Array.isArray(items)) {
                const sanitizedItems = items.map((item) => ({
                    ...item,
                    price: isNaN(Number(item.price)) ? 0 : Number(item.price), // 🔥 Converte para número
                    originalQuantity: item.quantity,
                }));
    
                setInventoryItems(sanitizedItems);
                setFilteredItems(sanitizedItems);
            } else {
                throw new Error('Formato de dados inesperado');
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar os itens do inventário.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchInventoryItems();
                await fetchInventoryConsumptions();
            } catch (error) {
                console.error('Erro ao carregar os dados do inventário:', error);
            }
        };
    
        fetchData();
    }, []);
    
    
    const fetchInventoryConsumptions = async () => {
        try {
            const consumptionData = await getInventoryConsumptions();
            const groupedConsumptions = consumptionData.reduce(
                (acc: { [key: number]: InventoryReduction[] }, item: any) => {
                    if (!acc[item.item]) {
                        acc[item.item] = [];
                    }
                    acc[item.item].push({
                        id: item.id, // 🔥 Adicionando o ID
                        quantity: item.quantity,
                        date: item.consumed_at,
                    });
                    return acc;
                },
                {}
            );
            setReductions(groupedConsumptions);
        } catch (error) {
            console.error('Erro ao carregar as baixas de inventário:', error);
        }
    };
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createInventoryItem(formData);
            alert('Item de inventário criado com sucesso!');
            setFormData({
                name: '',
                location: 'RECEPCAO',
                quantity: 0,
                price: 0.0,
            });
            fetchInventoryItems();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar o item de inventário. Por favor, tente novamente.');
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm('Tem certeza que deseja excluir este item?');
        if (confirmDelete) {
            try {
                await deleteInventoryItem(id);
                alert('Item excluído com sucesso!');
                fetchInventoryItems();
            } catch (err) {
                console.error(err);
                alert('Erro ao excluir o item. Por favor, tente novamente.');
            }
        }
    };

    const handleOpenModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setReductionData({ quantity: 0, date: '' });
        setNewQuantity(null);
    };

    const handleReductionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setReductionData({
            ...reductionData,
            [name]: name === 'quantity' ? parseInt(value) || 0 : value,
        });
    };

    const handleNewQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewQuantity(parseInt(e.target.value) || 0);
    };

    const calculateTotalReductionsValue = (items: InventoryItem[], reductionsData: { [key: number]: InventoryReduction[] }) => {
        let total = 0;
        Object.entries(reductionsData).forEach(([itemId, reductionsList]) => {
            const item = items.find((item) => item.id === parseInt(itemId));
            if (item) {
                reductionsList.forEach((reduction) => {
                    total += reduction.quantity * item.price;
                });
            }
        });
        setTotalReductionsValue(total > 0 ? total : null);
        localStorage.setItem('totalReductionsValue', JSON.stringify(total));
    };

    const handleConfirmReduction = async () => {
        if (selectedItem) {
            try {
                const newConsumption = {
                    item: selectedItem.id,
                    quantity: reductionData.quantity,
                };
                await createInventoryConsumption(newConsumption);
                alert('Baixa registrada com sucesso!');
                
                // Atualiza a lista de itens e baixas
                fetchInventoryItems();
                fetchInventoryConsumptions();
                setSelectedItem(null);
            } catch (error) {
                console.error('Erro ao registrar a baixa:', error);
                alert('Erro ao registrar a baixa. Por favor, tente novamente.');
            }
        }
    };
    

    const handleConfirmNewQuantity = () => {
        if (selectedItem && newQuantity !== null) {
            const updatedInventoryItems = inventoryItems.map((item) =>
                item.id === selectedItem.id
                    ? { ...item, quantity: newQuantity }
                    : item
            );
            setInventoryItems(updatedInventoryItems);
            setFilteredItems(updatedInventoryItems);
    
            // Atualizar o localStorage com o novo estado
            localStorage.setItem('inventoryItems', JSON.stringify(updatedInventoryItems));
    
            setNewQuantity(null);
            alert('Quantidade do estoque atualizada com sucesso!');
        }
    };
    

    const handleDeleteReduction = async (itemId: number, reductionIndex: number) => {
        const reductionToRemove = reductions[itemId][reductionIndex];
    
        if (!reductionToRemove || !reductionToRemove.id) {
            console.error("Erro: ID da redução não encontrado.");
            return;
        }
    
        const confirmDelete = window.confirm("Tem certeza que deseja remover esta baixa?");
        if (!confirmDelete) return;
    
        try {
            // Deletar no backend
            await deleteInventoryConsumption(reductionToRemove.id);
    
            // Atualizar estado local após remoção bem-sucedida
            const updatedReductions = {
                ...reductions,
                [itemId]: reductions[itemId].filter((_, index) => index !== reductionIndex),
            };
    
            setReductions(updatedReductions);
            localStorage.setItem('reductions', JSON.stringify(updatedReductions));
    
            const updatedInventoryItems = inventoryItems.map((item) =>
                item.id === itemId
                    ? { ...item, quantity: item.quantity + reductionToRemove.quantity }
                    : item
            );
    
            setInventoryItems(updatedInventoryItems);
            setFilteredItems(updatedInventoryItems);
            localStorage.setItem('inventoryItems', JSON.stringify(updatedInventoryItems));
    
            calculateTotalReductionsValue(updatedInventoryItems, updatedReductions);
            alert("Baixa removida com sucesso!");
        } catch (error) {
            console.error("Erro ao remover baixa:", error);
            alert("Erro ao remover a baixa. Por favor, tente novamente.");
        }
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const handleFilter = (location: string) => {
        setFilteredItems(inventoryItems.filter((item) => item.location === location));
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    

    return (
        <PageContainer padding="0px">
            <div className="main2">
                <SidebarComponent />
                <div className="criar">
                    <h1>Cadastrar Itens do Estoque</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="cadastro">
                            <div className="row">
                                <div className="input">
                                    <label htmlFor="name">Nome do Item:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Ex.: Cadeira de Escritório"
                                        required
                                    />
                                </div><br />
                                <div className="input">
                                    <label htmlFor="location">Localização:</label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        style={{width:"109%"}}
                                    >
                                        <option value="RECEPCAO">Recepção</option>
                                        <option value="COZINHA">Cozinha</option>
                                    </select>
                                </div><br />
                                <div className="input">
                                    <label htmlFor="quantity">Quantidade:</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="Ex.: 10"
                                        required
                                    />
                                </div><br />
                                <div className="input">
                                    <label htmlFor="price">Preço Unitário (R$):</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="Ex.: 50.00"
                                        required
                                    />
                                </div><br />
                            </div>
                        </div>
                        <button type="submit" className="button-cadastro">Cadastrar</button>
                    </form>
                </div>
                <div className="separator" />
                <div className="gerenciar">
                    <h1>Gerenciar Itens do Estoque</h1>
                    <div className="filters">
                        <button onClick={() => setFilteredItems(inventoryItems)}>Todos</button>
                        <button onClick={() => handleFilter('RECEPCAO')}>Recepção</button>
                        <button onClick={() => handleFilter('COZINHA')}>Cozinha</button>
                    </div>
                    {loading ? (
                        <p>Carregando...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <Container>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <Containerr key={item.id} className="banner">
                                        <div className="row">
                                            <p className="nome">
                                                <strong>Item:</strong> {item.name}
                                            </p>
                                            <p className="localizacao">
                                                <strong>Local:</strong> {item.location === 'RECEPCAO' ? 'Recepção' : 'Cozinha'}
                                            </p>
                                            <p className="quantidade">
                                                <strong>Quantidade:</strong> {item.quantity}
                                            </p>
                                            <p className="preco">
                                             <strong>Preço:</strong> R$ {typeof item.price === 'number' ? item.price.toFixed(2) : "N/A"}
                                            </p>

                                            <div className="buttons-inv">
                                                <FaPencil className='edit' size={20} onClick={() => handleOpenModal(item)} />
                                                <FaTrashAlt
                                                    className="lixeira"
                                                    size={20}
                                                    onClick={() => handleDelete(item.id)}
                                                />
                                            </div>
                                        </div>
                                    </Containerr>
                                ))
                            ) : (
                                <p>Nenhum item encontrado.</p>
                            )}
                        </Container>
                    )}
                </div>

                {selectedItem && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className='faixa'>
                                <h2 style={{marginTop:"1%"}}> Estoque {selectedItem.name}</h2>
                            </div>
                            <div className='reductionsad'>
                                <h3>Adicionar Baixas</h3>
                                <div className='cadastro'>
                                <div className='row'>
                                 <div className='input' style={{marginLeft:"-160%",marginTop:"-20%"}}>
                                    <label>
                                        Data:
                                        </label>
                                        <input
                                        
                                            type="date"
                                            name="date"
                                            value={reductionData.date}
                                            onChange={handleReductionChange}
                                            required
                                        />
                                 </div>
                                 <div className='input' style={{marginLeft:"-160%"}}>
                                    <label>
                                        Quantidade:
                                        </label>
                                        <input
                                            style={{width:"99%"}}
                                            type="number"
                                            name="quantity"
                                            value={reductionData.quantity}
                                            onChange={handleReductionChange}
                                            min="1"
                                            max={selectedItem.quantity}
                                            required
                                        />
                                    
                                </div>
                                <br />
                                <button className='confBaixa' onClick={handleConfirmReduction}>Confirmar</button>
                               
                            </div>
                            <div className='ajuste-qntd'>
                                <h3>Nova Quantidade</h3>
                                <div className='input'style={{marginLeft:"6%"}} >
                                <label>
                                    Novo Valor
                                    </label>
                                    <input
                                     style={{width:"64%"}}
                                        type="number"
                                        value={newQuantity || ''}
                                        onChange={handleNewQuantityChange}
                                        min="0"
                                    />
                                    </div>
                                <br />
                                <button  className='att-qntd' onClick={handleConfirmNewQuantity}>Atualizar</button>
                            </div>
                            </div>
                            </div>
                            <div className='divider-vertical'></div>
                            <div className="divider-horizontal">  </div>
                            <div className="reductions">
                               <h3>Baixas Realizadas</h3>
                           <div className='baixas-list'>
                              {(reductions[selectedItem.id] || []).map((reduction, index) => (
                              <div key={index} className="reduction-item" >
                              {/* <FaTrashAlt
                                className="lixoBaixa"
                                onClick={() => handleDeleteReduction(selectedItem.id, index)}
                                 /> */}  
                             
                                  <p style={{marginTop:"-9%",marginLeft:"17%"}}>
                                  <strong>Data:</strong> {formatDate(reduction.date)} - <strong>Qntd:</strong> {reduction.quantity}
                                 </p>
                             </div>
                            ))}
                          </div>
                          {totalReductionsValue !== null && (
                        <div className="total">
                          <h4>
                               Total das Baixas: R$ {totalReductionsValue.toFixed(2)}
                         </h4>
                         {/*<div className="divider-horizontal" style={{marginLeft:"-27%"}}>  </div> */}
                         
                       </div>
                         )}
                        </div>

                            <button className='closeModalinv' onClick={handleCloseModal}>Fechar</button>
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}

export default GerenciaInventario;
